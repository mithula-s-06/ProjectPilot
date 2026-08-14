import React, { useState, useEffect, useMemo } from 'react';
import { FiSend, FiMessageSquare, FiUsers, FiUser, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import { api, addNotification } from '../utils/api';

const Suggestions = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedRecipientEmail, setSelectedRecipientEmail] = useState(''); // specific email of recipient member
  const [suggestionText, setSuggestionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Load projects and users on mount
  const loadData = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const loggedInMentorName = currentUser.fullName || currentUser.name || 'Dr. Kumar';

      // 1. Fetch Projects
      const fetchedProj = await api.listProjects() || [];
      localStorage.setItem('projects', JSON.stringify(fetchedProj));
      
      // Filter projects assigned to this mentor
      const mentorProj = fetchedProj.filter(p => p.mentor && p.mentor.toLowerCase() === loggedInMentorName.toLowerCase());
      setProjects(mentorProj);
      if (mentorProj.length > 0 && !selectedProjectId) {
        setSelectedProjectId(mentorProj[0].id);
      }

      // 2. Fetch Users
      const fetchedUsers = await api.listUsers() || [];
      const mappedUsers = fetchedUsers.map(u => ({
        id: u.id,
        name: u.name || u.fullName,
        fullName: u.fullName || u.name,
        email: u.email,
        role: (u.role === 'TEAM_LEADER' || u.role === 'Team Leader') ? 'Team Leader' : (u.role === 'MENTOR' || u.role === 'Mentor') ? 'Mentor' : 'Student',
        team: u.team || 'Not Assigned'
      }));
      localStorage.setItem('registeredUsers', JSON.stringify(mappedUsers));
      setUsers(mappedUsers);

      // 3. Fetch Teams
      try {
        const fetchedTeams = await api.listTeams() || [];
        localStorage.setItem('teams', JSON.stringify(fetchedTeams));
      } catch (teamErr) {
        console.warn('Failed to sync teams in Suggestions page:', teamErr);
      }
    } catch (e) {
      console.error('Failed to load data in Suggestions page:', e);
      // Fallback local storage
      const storedProj = localStorage.getItem('projects');
      const storedUsers = localStorage.getItem('registeredUsers');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const loggedInMentorName = currentUser.fullName || currentUser.name || 'Dr. Kumar';

      const projectsList = storedProj ? JSON.parse(storedProj) : [];
      const mentorProj = projectsList.filter(p => p.mentor && p.mentor.toLowerCase() === loggedInMentorName.toLowerCase());
      setProjects(mentorProj);
      if (mentorProj.length > 0 && !selectedProjectId) {
        setSelectedProjectId(mentorProj[0].id);
      }

      const parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];
      const mappedFallbackUsers = parsedUsers.map(u => ({
        id: u.id,
        name: u.name || u.fullName,
        fullName: u.fullName || u.name,
        email: u.email,
        role: (u.role === 'TEAM_LEADER' || u.role === 'Team Leader') ? 'Team Leader' : (u.role === 'MENTOR' || u.role === 'Mentor') ? 'Mentor' : 'Student',
        team: u.team || 'Not Assigned'
      }));
      setUsers(mappedFallbackUsers);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('focus', loadData);
    return () => window.removeEventListener('focus', loadData);
  }, []);

  // Find currently selected project details
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Find members in the selected project (memoized to prevent infinite renders)
  const projectMembers = useMemo(() => {
    if (!selectedProject || !selectedProject.teamName) return [];
    
    // 1. Parse teams list to extract direct roster members
    const storedTeams = JSON.parse(localStorage.getItem('teams') || '[]');
    const matchedTeam = storedTeams.find(t => t.name && t.name.toLowerCase() === selectedProject.teamName.toLowerCase());

    const namesToFind = new Set();
    if (matchedTeam) {
      if (matchedTeam.leaderName && matchedTeam.leaderName !== 'Not Assigned') {
        namesToFind.add(matchedTeam.leaderName.trim().toLowerCase());
      }
      if (matchedTeam.members && Array.isArray(matchedTeam.members)) {
        matchedTeam.members.forEach(m => {
          if (m) namesToFind.add(m.trim().toLowerCase());
        });
      }
    }

    // 2. Helper to check team attribute mapping
    const isUserInTeam = (user, tName) => {
      if (!user || !user.team || !tName) return false;
      return user.team.split(',').map(t => t.trim().toLowerCase()).includes(tName.toLowerCase());
    };

    // 3. Resolve by name matches or team mapping matches
    return users.filter(u => {
      if (u.role === 'Mentor') return false;

      const nameMatch = u.name && namesToFind.has(u.name.trim().toLowerCase());
      const fullNameMatch = u.fullName && namesToFind.has(u.fullName.trim().toLowerCase());
      const teamMatch = isUserInTeam(u, selectedProject.teamName);

      return nameMatch || fullNameMatch || teamMatch;
    });
  }, [selectedProject, users]);

  // Automatically select the first team member when the project members list loads or updates
  useEffect(() => {
    if (projectMembers.length > 0) {
      const exists = projectMembers.some(m => m.email === selectedRecipientEmail);
      if (!exists) {
        setSelectedRecipientEmail(projectMembers[0].email);
      }
    } else {
      setSelectedRecipientEmail('');
    }
  }, [projectMembers, selectedRecipientEmail]);

  const [projectSuggestions, setProjectSuggestions] = useState([]);

  // Fetch project-specific suggestions from MongoDB in real-time
  useEffect(() => {
    async function fetchProjectSuggestions() {
      if (!selectedProjectId) {
        setProjectSuggestions([]);
        return;
      }
      try {
        const list = await api.getSuggestionsByProject(selectedProjectId) || [];
        // Sort suggestions by timestamp/id descending
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setProjectSuggestions(list);
      } catch (err) {
        console.warn('Failed to fetch suggestions from MongoDB:', err);
        // Fallback local project comments
        if (selectedProject && selectedProject.mentorFeedback) {
          const fallbackList = (selectedProject.mentorFeedback.allComments || []).map(c => ({
            id: c.id,
            mentorName: c.author,
            date: c.date,
            text: c.text
          }));
          setProjectSuggestions(fallbackList);
        }
      }
    }
    fetchProjectSuggestions();
  }, [selectedProjectId, projects]);

  // Handle submit suggestion
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      showToast('Please select a team.', 'error');
      return;
    }
    if (!suggestionText.trim()) {
      showToast('Please enter your suggestion.', 'error');
      return;
    }

    setLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const loggedInMentorName = currentUser.fullName || currentUser.name || 'Dr. Kumar';
      const dateStr = new Date().toISOString().split('T')[0];

      // 1. Resolve Recipient Name
      const matchedMember = projectMembers.find(m => m.email === selectedRecipientEmail);
      if (!matchedMember) {
        showToast('Please select a valid recipient member.', 'error');
        setLoading(false);
        return;
      }
      const recipientLabel = `${matchedMember.name} (${matchedMember.role})`;
      const targetEmail = matchedMember.email;

      // 2. Prepare Mentor Feedback Comment
      const newComment = {
        id: `fb-${Date.now()}`,
        author: loggedInMentorName,
        date: dateStr,
        text: `[Directive for ${recipientLabel}]: ${suggestionText}`
      };

      const currentFeedback = selectedProject.mentorFeedback || { latestFeedback: 'No feedback submitted yet.', date: '--', allComments: [] };
      const updatedFeedback = {
        latestFeedback: suggestionText,
        date: dateStr,
        allComments: [newComment, ...(currentFeedback.allComments || [])]
      };

      const updatedProj = {
        ...selectedProject,
        mentorFeedback: updatedFeedback
      };

      // 2.5 Save Suggestion record to MongoDB suggestions collection
      let savedSug = null;
      try {
        const res = await api.createSuggestion({
          mentorName: loggedInMentorName,
          teamName: selectedProject.teamName,
          projectId: selectedProject.id,
          recipientEmail: targetEmail,
          recipientName: matchedMember.name || matchedMember.fullName,
          recipientRole: matchedMember.role,
          text: suggestionText,
          date: dateStr
        });
        savedSug = res;
      } catch (sugErr) {
        console.warn('Failed to save suggestion to MongoDB suggestions collection:', sugErr);
      }

      // 3. Save to Backend Database
      await api.updateProject(selectedProject.id, updatedProj);

      // 4. Send Notifications
      const teamName = selectedProject.teamName;
      await addNotification(
        'New Personal Advisor Directive',
        `Mentor ${loggedInMentorName} sent you a directive: "${suggestionText}"`,
        targetEmail,
        teamName,
        'success'
      );

      // 5. Update local state
      setProjects(prev => prev.map(p => p.id === selectedProjectId ? updatedProj : p));
      
      // Update suggestions list state
      if (savedSug) {
        setProjectSuggestions(prev => [savedSug, ...prev]);
      } else {
        setProjectSuggestions(prev => [{
          id: `fb-${Date.now()}`,
          mentorName: loggedInMentorName,
          date: dateStr,
          text: suggestionText,
          recipientName: matchedMember.name || matchedMember.fullName,
          recipientRole: matchedMember.role
        }, ...prev]);
      }

      // Update global projects storage
      const allProj = JSON.parse(localStorage.getItem('projects') || '[]');
      const nextAllProj = allProj.map(p => p.id === selectedProjectId ? updatedProj : p);
      localStorage.setItem('projects', JSON.stringify(nextAllProj));

      showToast('Suggestion successfully submitted and saved!', 'success');
      setSuggestionText('');
    } catch (err) {
      console.error('Failed to submit suggestion:', err);
      showToast('Failed to save suggestion. Verify connection to backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };



  return (
    <div className="space-y-6 w-full text-left max-w-4xl pb-12 animate-fade-in">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold shadow-lg transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
        }`}>
          <FiCheckCircle className="w-4 h-4" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
          Advisor Suggestions Panel
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-muted">
          Select an active assigned team, choose a recipient, and write directives or guidelines to guide their sprint execution.
        </p>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Form Block (Left/Main) */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-5">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text pb-2.5 border-b border-brand-border/40 flex items-center gap-2">
              <FiMessageSquare className="w-4 h-4 text-cyan-500" />
              Write New Suggestion
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Select Team */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-brand-text-muted uppercase tracking-wider block">
                  Select Assigned Team
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-card text-brand-text text-sm font-bold focus:border-cyan-500 focus:outline-none transition-colors"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.teamName} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Recipient */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-brand-text-muted uppercase tracking-wider block">
                  Select Recipient
                </label>
                <select
                  value={selectedRecipientEmail}
                  onChange={(e) => setSelectedRecipientEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-card text-brand-text text-sm font-bold focus:border-cyan-500 focus:outline-none transition-colors"
                >

                  {projectMembers.map((m) => (
                    <option key={m.email} value={m.email}>
                      {m.name || m.fullName} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Suggestion Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-brand-text-muted uppercase tracking-wider block">
                  Suggestion / Comment Details
                </label>
                <textarea
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder="Enter details of what the team or student should focus on next..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-card text-brand-text text-sm font-semibold focus:border-cyan-500 focus:outline-none transition-colors resize-none placeholder:text-brand-text-muted/50"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-55 disabled:cursor-not-allowed"
              >
                <FiSend className="w-3.5 h-3.5" />
                {loading ? 'Submitting...' : 'Send Suggestion'}
              </button>

            </form>
          </div>

          {/* History / Log Panel (Right) */}
          <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text pb-2.5 border-b border-brand-border/40 flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-cyan-500" />
              Directives Sent
            </h3>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
              {projectSuggestions.length > 0 ? (
                projectSuggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className="p-3.5 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10 hover:border-cyan-500/20 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-brand-border/40 pb-1">
                      <span className="text-[9px] font-extrabold text-cyan-500 uppercase tracking-wider block">
                        To: {sug.recipientName || 'Member'} ({sug.recipientRole || 'Student'})
                      </span>
                      <span className="text-[10px] font-bold text-brand-text-muted/60 flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" /> {sug.date}
                      </span>
                    </div>
                    <p className="text-xs text-brand-text leading-relaxed mt-1">
                      {sug.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-brand-text-muted italic">
                  No suggestions sent for this project yet.
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="py-12 text-center text-sm text-brand-text-muted italic bg-brand-card/25 border border-brand-border rounded-2xl">
          No active assigned projects currently linked to your profile to send suggestions to.
        </div>
      )}

    </div>
  );
};

export default Suggestions;
