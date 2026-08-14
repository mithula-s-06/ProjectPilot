import React, { useState } from 'react';
import { FiPlus, FiX, FiCheck, FiArrowLeft } from 'react-icons/fi';
import TeamMemberCard from '../components/TeamMemberCard';
import { api, addNotification } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';

const TeamMembers = ({ readOnly = false, projects = [] }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'primary',
    onConfirm: () => {},
  });
  const [members, setMembers] = useState(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
      const myTeamName = myUserRecord ? myUserRecord.team : 'Not Assigned';
      
      if (myTeamName && myTeamName !== 'Not Assigned') {
        const teamUsers = registeredUsers.filter(u => u.team === myTeamName);
        const storedProj = localStorage.getItem('projects');
        const allProj = storedProj ? JSON.parse(storedProj) : [];
        const myProj = allProj.find(p => p.teamName && p.teamName.toLowerCase() === myTeamName.toLowerCase());
        const projectTasks = myProj ? (myProj.tasks || []) : [];

        return teamUsers.map(u => {
          const userName = u.fullName || u.name || '';
          const userEmail = u.email || '';
          const matchedTasks = projectTasks.filter(t => 
            t.assignedTo && 
            (t.assignedTo.toLowerCase() === userName.toLowerCase() || 
             t.assignedTo.toLowerCase() === userEmail.toLowerCase())
          ).map(t => t.name);

          return {
            name: userName,
            role: u.role,
            email: userEmail,
            githubUsername: u.githubUsername || userName.toLowerCase().replace(/\s+/g, '-'),
            contribution: u.contribution !== undefined ? u.contribution : (u.role === 'Team Leader' ? 40 : Math.floor(Math.random() * 20) + 15),
            currentTasks: matchedTasks.length > 0 ? matchedTasks : ['Awaiting task assignment'],
            status: u.status || 'Active'
          };
        });
      }
    } catch (err) {
      console.error(err);
    }
    return [];
  });

  React.useEffect(() => {
    let active = true;
    const fetchTeamMembers = async () => {
      try {
        const teamName = selectedProject?.teamName;
        if (!teamName || teamName === 'Not Assigned') return;

        const fetchedUsers = await api.listUsers() || [];
        if (!active) return;

        // Sync local storage so other tabs see it too
        localStorage.setItem('registeredUsers', JSON.stringify(fetchedUsers));

        let databaseTeams = [];
        try {
          databaseTeams = await api.listTeams() || [];
        } catch (dbErr) {
          console.warn('Failed to fetch teams list inside TeamMembers:', dbErr);
        }

        const isUserInTeam = (u, tName) => {
          if (!u || !u.team || !tName) return false;
          return u.team.split(',').map(t => t.trim().toLowerCase()).includes(tName.toLowerCase());
        };

        const matchedDbTeam = databaseTeams.find(dt => dt.name && dt.name.toLowerCase() === teamName.toLowerCase());
        const dbLeaderName = matchedDbTeam ? matchedDbTeam.leaderName : null;

        const leaderUser = fetchedUsers.find(u => 
          (u.role === 'TEAM_LEADER' && dbLeaderName && u.name && u.name.toLowerCase() === dbLeaderName.toLowerCase()) ||
          (u.role === 'TEAM_LEADER' && isUserInTeam(u, teamName))
        );

        const otherTeamUsers = fetchedUsers.filter(u => 
          isUserInTeam(u, teamName) && 
          (!leaderUser || u.id !== leaderUser.id)
        );

        const listToMap = [];
        if (leaderUser) {
          listToMap.push(leaderUser);
        }
        listToMap.push(...otherTeamUsers);

        const projectTasks = selectedProject?.tasks || [];

        const mappedMembers = listToMap.map(u => {
          const userName = u.name || '';
          const userEmail = u.email || '';
          const matchedTasks = projectTasks.filter(t => 
            t.assignedTo && 
            (t.assignedTo.toLowerCase() === userName.toLowerCase() || 
             t.assignedTo.toLowerCase() === userEmail.toLowerCase())
          ).map(t => t.name);

          return {
            name: userName,
            role: u.role === 'TEAM_LEADER' ? 'Team Leader' : u.role === 'MENTOR' ? 'Mentor' : 'Student',
            email: userEmail,
            githubUsername: u.githubUsername || userName.toLowerCase().replace(/\s+/g, '-'),
            contribution: u.contribution !== undefined ? u.contribution : (u.role === 'TEAM_LEADER' ? 40 : Math.floor(Math.random() * 20) + 15),
            currentTasks: matchedTasks.length > 0 ? matchedTasks : ['Awaiting task assignment'],
            status: u.status || 'Active'
          };
        });
        
        setMembers(mappedMembers);
      } catch (err) {
        console.error('Failed to load team members from database:', err);
      }
    };

    fetchTeamMembers();
    return () => {
      active = false;
    };
  }, [selectedProject]);

  const [editingMember, setEditingMember] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: '',
    contribution: 0,
    tasksString: ''
  });

  const handleEditMember = (member) => {
    setEditingMember(member);
    setEditFormData({
      name: member.name,
      role: member.role || 'Developer',
      contribution: member.contribution || 0,
      tasksString: (member.currentTasks || []).join(', ')
    });
  };

  const handleDeleteMember = (memberToDelete) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Remove Team Member?',
      message: `Are you sure you want to remove "${memberToDelete.name}" from the team?`,
      confirmText: 'Remove Member',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
        try {
          const stored = localStorage.getItem('registeredUsers');
          if (stored) {
            const registeredUsers = JSON.parse(stored);
            const idx = registeredUsers.findIndex(u => u.email.toLowerCase() === memberToDelete.email.toLowerCase());
            if (idx !== -1) {
               const matchedUser = registeredUsers[idx];
               const teamName = selectedProject?.teamName || 'Not Assigned';
               let updatedTeamString = 'Not Assigned';
               if (matchedUser.team && matchedUser.team !== 'Not Assigned') {
                 const existingTeams = matchedUser.team.split(',').map(t => t.trim());
                 const filteredTeams = existingTeams.filter(t => t.toLowerCase() !== teamName.toLowerCase());
                 updatedTeamString = filteredTeams.length > 0 ? filteredTeams.join(', ') : 'Not Assigned';
               }
               matchedUser.team = updatedTeamString;
               localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

               api.updateUserProfile(matchedUser.id, {
                 name: matchedUser.fullName || matchedUser.name,
                 email: matchedUser.email,
                 role: matchedUser.role === 'Team Leader' ? 'TEAM_LEADER' : matchedUser.role === 'Mentor' ? 'MENTOR' : 'STUDENT',
                 department: matchedUser.department || 'Computer Science & Engineering',
                 team: updatedTeamString,
                 collegeName: matchedUser.collegeName || ''
               }).catch(err => console.warn('Failed to sync deleted member profile:', err));

               try {
                 addNotification(
                   'Removed from Team',
                   `You have been removed from team "${teamName}".`,
                   matchedUser.email,
                   teamName,
                   'warning'
                 );
               } catch (err) {
                 console.error('Failed to dispatch removed from team notification:', err);
               }
              
              setMembers(prev => prev.filter(m => m.email.toLowerCase() !== memberToDelete.email.toLowerCase()));
              
              setSuccessMsg(`Member "${memberToDelete.name}" was successfully removed from the team.`);
              setTimeout(() => setSuccessMsg(''), 3000);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) return;

    try {
      const stored = localStorage.getItem('registeredUsers');
      if (stored) {
        const registeredUsers = JSON.parse(stored);
        const idx = registeredUsers.findIndex(u => u.email.toLowerCase() === editingMember.email.toLowerCase());
        if (idx !== -1) {
          registeredUsers[idx].fullName = editFormData.name.trim();
          registeredUsers[idx].role = editFormData.role;
          registeredUsers[idx].contribution = Number(editFormData.contribution);
          
          const tasks = editFormData.tasksString
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);
          registeredUsers[idx].currentTasks = tasks.length > 0 ? tasks : ['Awaiting task assignment'];

          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

          const matchedUser = registeredUsers[idx];
          api.updateUserProfile(matchedUser.id, {
            name: matchedUser.fullName || matchedUser.name,
            email: matchedUser.email,
            role: matchedUser.role === 'Team Leader' ? 'TEAM_LEADER' : matchedUser.role === 'Mentor' ? 'MENTOR' : 'STUDENT',
            department: matchedUser.department || 'Computer Science & Engineering',
            team: matchedUser.team,
            collegeName: matchedUser.collegeName || ''
          }).catch(err => console.warn('Failed to sync edited member profile:', err));

          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (currentUser.email && currentUser.email.toLowerCase() === editingMember.email.toLowerCase()) {
            currentUser.fullName = editFormData.name.trim();
            currentUser.role = editFormData.role;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
          }

          setMembers(prev => prev.map(m => {
            if (m.email.toLowerCase() === editingMember.email.toLowerCase()) {
              return {
                ...m,
                name: editFormData.name.trim(),
                role: editFormData.role,
                contribution: Number(editFormData.contribution),
                currentTasks: tasks.length > 0 ? tasks : ['Awaiting task assignment']
              };
            }
            return m;
          }));

          setSuccessMsg('Member details updated successfully!');
          setTimeout(() => {
            setSuccessMsg('');
            setEditingMember(null);
          }, 1500);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    registerNumber: '',
    department: 'Computer Science & Engineering',
    year: '3rd Year'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setSuccessMsg('Name and Email are required.');
      setTimeout(() => setSuccessMsg(''), 3000);
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
      const myTeamName = myUserRecord ? myUserRecord.team : 'Not Assigned';
      const targetTeamName = selectedProject?.teamName || myTeamName;

      // Check if user is already in the current team roster
      const isAlreadyInTeam = members.some(m => m.email?.toLowerCase() === formData.email.trim().toLowerCase());
      if (isAlreadyInTeam) {
        setSuccessMsg('This member is already in your team.');
        setTimeout(() => setSuccessMsg(''), 3000);
        return;
      }

      // Check if user exists in registration directory
      const existingUserIdx = registeredUsers.findIndex(u => u.email.toLowerCase() === formData.email.trim().toLowerCase());
      
      if (existingUserIdx === -1) {
        setSuccessMsg('This student is not signed up yet. Members must register an account first.');
        setTimeout(() => setSuccessMsg(''), 4000);
        return;
      }

      // Update existing user's team details
      const matchedUser = registeredUsers[existingUserIdx];
      let updatedTeamString = targetTeamName;
      if (matchedUser.team && matchedUser.team !== 'Not Assigned') {
        const existingTeams = matchedUser.team.split(',').map(t => t.trim());
        if (!existingTeams.map(t => t.toLowerCase()).includes(targetTeamName.toLowerCase())) {
          existingTeams.push(targetTeamName);
        }
        updatedTeamString = existingTeams.filter(t => t.toLowerCase() !== 'not assigned').join(', ');
      }
      matchedUser.team = updatedTeamString;
      
      const displayName = matchedUser.fullName || matchedUser.name || formData.name;

      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

      api.updateUserProfile(matchedUser.id, {
        name: matchedUser.fullName || matchedUser.name || displayName,
        email: matchedUser.email,
        role: matchedUser.role === 'Team Leader' ? 'TEAM_LEADER' : matchedUser.role === 'Mentor' ? 'MENTOR' : 'STUDENT',
        department: matchedUser.department || 'Computer Science & Engineering',
        team: updatedTeamString,
        collegeName: matchedUser.collegeName || ''
      }).catch(err => console.warn('Failed to sync assigned member profile:', err));

      try {
        addNotification(
          'Added to Team',
          `You have been added to team "${targetTeamName}".`,
          matchedUser.email,
          targetTeamName,
          'success'
        );
      } catch (err) {
        console.error('Failed to dispatch added to team notification:', err);
      }

      setMembers(prev => [
        ...prev,
        {
          name: displayName,
          role: matchedUser.role || 'Developer',
          email: matchedUser.email,
          githubUsername: matchedUser.githubUsername || displayName.toLowerCase().replace(/\s+/g, '-'),
          contribution: matchedUser.contribution !== undefined ? matchedUser.contribution : 0,
          currentTasks: matchedUser.currentTasks || ['Awaiting task assignment'],
          status: matchedUser.status || 'Active'
        }
      ]);

      setSuccessMsg('Team member assigned successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        setModalOpen(false);
        setFormData({ name: '', email: '', registerNumber: '', department: 'Computer Science & Engineering', year: '3rd Year' });
      }, 1500);
    } catch (err) {
      console.error(err);
      setSuccessMsg('Failed to save team member.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  if (!selectedProject) {
    return (
      <div className="space-y-6 w-full text-left relative animate-fade-in">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
            Team Projects
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Select a project below to view its team members and manage collaborators.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm text-center max-w-lg mt-6">
            <p className="text-xs text-brand-text-muted leading-relaxed">
              No assigned projects found. Please set up your team on the Dashboard or ensure your user profile is correctly assigned to a team.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {projects.map((proj) => (
              <div 
                key={proj.id} 
                className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm flex flex-col justify-between hover:border-primary/20 hover:shadow-glow-primary/5 transition-all duration-300 h-full text-left"
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-brand-text">{proj.name}</h4>
                    <span className="text-[10px] text-brand-text-muted font-semibold block mt-0.5">{proj.domain}</span>
                    <span className="text-[10px] text-brand-text-muted/75 font-bold block mt-1">
                      Team Name: <strong className="text-brand-text">{proj.teamName || 'Not Assigned'}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-brand-text-muted/80 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-border/40 mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                    {proj.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedProject(proj)}
                    className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary hover-lift transition-all duration-300 cursor-pointer"
                  >
                    View Team
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full text-left relative animate-fade-in">
      
      {/* Back button */}
      <button
        type="button"
        onClick={() => setSelectedProject(null)}
        className="flex items-center gap-2 text-xs font-bold text-brand-text-muted hover:text-brand-text uppercase tracking-wider transition-colors duration-300 group focus:outline-none cursor-pointer mb-2"
      >
        <FiArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        <span>Back to Projects</span>
      </button>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border/40 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
            Team Members: {selectedProject.name}
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            {readOnly 
              ? "View project team members, roles, and contribution progress." 
              : "Manage project team roles, track task workloads, and review contributions."}
          </p>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary hover-lift transition-all duration-300 inline-flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer self-start sm:self-auto"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        )}
      </div>

      {/* Roster Cards Grid */}
      {members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, idx) => (
            <TeamMemberCard 
              key={idx} 
              member={member} 
              onEdit={!readOnly ? () => handleEditMember(member) : null}
              onDelete={!readOnly && member.role !== 'Team Leader' ? () => handleDeleteMember(member) : null}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-brand-border bg-brand-card/20 text-brand-text-muted text-sm font-semibold select-none">
          No team members registered under your team yet. Add new members to build your team!
        </div>
      )}

      {/* Add Member Modal */}
      {modalOpen && (
        <>
          <div onClick={() => setModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300" />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-[450px] max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 z-50 text-left animate-scale-up custom-scrollbar">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">
                Assign Team Member
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1 rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer">
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {successMsg && (
                 <div className={`p-3 rounded-xl text-xs font-semibold text-center ${
                   successMsg.includes('successfully')
                     ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
                     : 'bg-rose-500/10 border border-rose-500/20 text-rose-500'
                 }`}>
                   {successMsg}
                 </div>
               )}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Student Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter student name"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Student Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter student email"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Year of Study</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm cursor-pointer"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors duration-300 focus:outline-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary transition-all duration-300 flex items-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>Assign Member</span>
                </button>
              </div>

            </form>
          </div>
        </>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <>
          <div onClick={() => setEditingMember(null)} className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300" />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-[450px] max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 z-50 text-left animate-scale-up custom-scrollbar">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">
                Edit Team Member
              </h3>
              <button type="button" onClick={() => setEditingMember(null)} className="p-1 rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer">
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {successMsg && (
                 <div className={`p-3 rounded-xl text-xs font-semibold text-center ${
                   successMsg.includes('successfully')
                     ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
                     : 'bg-rose-500/10 border border-rose-500/20 text-rose-500'
                 }`}>
                   {successMsg}
                 </div>
               )}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Student Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter student name"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Project Role</label>
                {editingMember.role === 'Team Leader' ? (
                  <input
                    type="text"
                    value={editFormData.role}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 focus:outline-none text-sm cursor-not-allowed font-semibold"
                  />
                ) : (
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm cursor-pointer"
                  >
                    <option value="Student">Student</option>
                    <option value="Developer">Developer</option>
                    <option value="Researcher">Researcher</option>
                    <option value="Analyst">Analyst</option>
                  </select>
                )}
              </div>



              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Assignments (Comma-separated)</label>
                <textarea
                  rows="3"
                  value={editFormData.tasksString}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, tasksString: e.target.value }))}
                  placeholder="e.g. Write tests, BLE calibrations, Configure gateways"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-primary/50 text-sm resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors duration-300 focus:outline-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary transition-all duration-300 flex items-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>

            </form>
          </div>
        </>
      )}
      
      {/* Global Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmText={confirmModalState.confirmText}
        cancelText={confirmModalState.cancelText}
        variant={confirmModalState.variant}
        onConfirm={confirmModalState.onConfirm}
        onCancel={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default TeamMembers;
