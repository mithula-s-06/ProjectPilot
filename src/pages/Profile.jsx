import React, { useState, useEffect } from 'react';
import { 
  FiShield, FiMail, FiUser, FiEdit3, FiKey, 
  FiBookOpen, FiAward, FiCheck, FiX, FiAlertCircle 
} from 'react-icons/fi';
import { usePage } from '../hooks/usePage';
import { api, addNotification } from '../utils/api';

const Profile = () => {
  const { currentPage } = usePage();

  // Unified Profile State (initialized from active login/signup session)
  const getInitialProfile = () => {
    const defaultData = {
      name: currentPage === 'admin' ? 'Administrator' : 'User',
      email: currentPage === 'admin' ? 'admin@pp.edu' : '',
      username: 'user_001',
      roleLabel: currentPage === 'admin' ? 'System Administrator' : (currentPage === 'team-leader' ? 'Team Leader' : 'Student'),
      department: 'Computer Science & Engineering',
      college: '',
      team: 'Not Assigned',
      projectsCount: 0,
      projectsList: []
    };

    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        
        // Find latest record from registeredUsers for the actual profile state!
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userRecord = registeredUsers.find(u => u.email.toLowerCase() === user.email.toLowerCase()) || user;

        // Calculate dynamic properties
        const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        const isMentor = userRecord.role === 'MENTOR' || userRecord.role === 'Mentor';
        
        let userTeamsString = userRecord.team || 'Not Assigned';
        let matchedProjects = [];
        
        if (isMentor) {
          // Mentor name matching
          const mentorName = (userRecord.fullName || userRecord.name || '').toLowerCase().trim();
          matchedProjects = allProjects.filter(p => {
            const pMentor = (p.mentor || p.mentorName || '').toLowerCase().trim();
            return pMentor === mentorName;
          });
          
          // Teams are the teams associated with those mentor projects
          const mentorTeams = matchedProjects
            .map(p => p.teamName)
            .filter(tName => tName && tName !== 'Not Assigned');
          
          // Remove duplicates
          const uniqueMentorTeams = [...new Set(mentorTeams)];
          userTeamsString = uniqueMentorTeams.length > 0 ? uniqueMentorTeams.join(', ') : 'Not Assigned';
        } else {
          // Student or Team Leader
          const userTeams = userTeamsString && userTeamsString !== 'Not Assigned'
            ? userTeamsString.split(',').map(t => t.trim().toLowerCase())
            : [];
            
          matchedProjects = allProjects.filter(p => {
            const pTeam = p.teamName ? p.teamName.toLowerCase().trim() : '';
            return userTeams.includes(pTeam) ||
                   (p.name && userTeams.some(t => p.name.toLowerCase().includes(t)));
          });
        }

        // Resolve display role label (ensure it matches the format of role label)
        let displayRole = 'Student';
        if (userRecord.role) {
          const rLower = userRecord.role.toLowerCase();
          if (rLower === 'team_leader' || rLower === 'team leader') {
            displayRole = 'Team Leader';
          } else if (rLower === 'mentor') {
            displayRole = 'Mentor';
          } else if (rLower === 'admin' || rLower === 'system administrator') {
            displayRole = 'System Administrator';
          }
        }

        const resolvedCollege = userRecord.collegeName || userRecord.college || user.collegeName || user.college || '';

        return {
          ...defaultData,
          name: userRecord.fullName || userRecord.name || defaultData.name,
          email: userRecord.email || defaultData.email,
          roleLabel: displayRole,
          college: resolvedCollege,
          department: userRecord.department || defaultData.department,
          team: userTeamsString,
          projectsCount: matchedProjects.length,
          projectsList: matchedProjects.map(p => p.name)
        };
      }
    } catch (e) {
      console.error("Failed to parse currentUser from localStorage", e);
    }
    return defaultData;
  };

  const [profileData, setProfileData] = useState(getInitialProfile);

  useEffect(() => {
    function calculateProfile(fetchedUsers, allProjects) {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) return;
        const user = JSON.parse(storedUser);
        const userEmail = (user.email || '').trim().toLowerCase();

        const myUserRecord = (fetchedUsers || []).find(u => u && u.email && u.email.trim().toLowerCase() === userEmail);
        if (myUserRecord) {
          // Update local currentUser storage
          const updatedUser = {
            ...user,
            fullName: myUserRecord.name || myUserRecord.fullName || user.fullName,
            team: myUserRecord.team || 'Not Assigned',
            collegeName: myUserRecord.collegeName || '',
            department: myUserRecord.department || ''
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));

          // Compute assigned projects and stats
          const isMentor = myUserRecord.role === 'MENTOR' || myUserRecord.role === 'Mentor' || myUserRecord.role === 'Mentor';
          let userTeamsString = myUserRecord.team || 'Not Assigned';
          let matchedProjects = [];

          if (isMentor) {
            const mentorName = (myUserRecord.name || myUserRecord.fullName || '').toLowerCase().trim();
            matchedProjects = allProjects.filter(p => {
              const pMentor = (p.mentor || p.mentorName || '').toLowerCase().trim();
              return pMentor === mentorName;
            });
            const mentorTeams = matchedProjects
              .map(p => p.teamName)
              .filter(tName => tName && tName !== 'Not Assigned');
            const uniqueTeams = [...new Set(mentorTeams)];
            userTeamsString = uniqueTeams.length > 0 ? uniqueTeams.join(', ') : 'Not Assigned';
          } else {
            const userTeams = userTeamsString && userTeamsString !== 'Not Assigned'
              ? userTeamsString.split(',').map(t => t.trim().toLowerCase())
              : [];
            matchedProjects = allProjects.filter(p => {
              const pTeam = p.teamName ? p.teamName.toLowerCase().trim() : '';
              return userTeams.includes(pTeam) ||
                     (p.name && userTeams.some(t => p.name.toLowerCase().includes(t)));
            });
          }

          let displayRole = 'Student';
          if (myUserRecord.role) {
            const rLower = myUserRecord.role.toLowerCase();
            if (rLower === 'team_leader' || rLower === 'team leader') {
              displayRole = 'Team Leader';
            } else if (rLower === 'mentor') {
              displayRole = 'Mentor';
            } else if (rLower === 'admin' || rLower === 'system administrator') {
              displayRole = 'System Administrator';
            }
          }

          setProfileData({
            name: myUserRecord.name || myUserRecord.fullName || user.fullName || user.name,
            email: myUserRecord.email,
            roleLabel: displayRole,
            college: myUserRecord.collegeName || '',
            department: myUserRecord.department || '',
            team: userTeamsString,
            projectsCount: matchedProjects.length,
            projectsList: matchedProjects.map(p => p.name)
          });
        }
      } catch (calcErr) {
        console.warn('Calculation failed inside calculateProfile:', calcErr);
      }
    }

    async function loadFreshProfile() {
      // 1. Initial immediate offline sync from local storage cache
      try {
        const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const storedProj = JSON.parse(localStorage.getItem('projects') || '[]');
        if (storedUsers.length > 0) {
          calculateProfile(storedUsers, storedProj);
        }
      } catch (err) {
        console.warn('Offline profile calculations failed:', err);
      }

      // 2. Fetch fresh users and projects list from MongoDB
      try {
        const [fetchedUsers, allProjects] = await Promise.all([
          api.listUsers() || [],
          api.listProjects() || []
        ]);

        const mappedUsers = (fetchedUsers || []).map(u => ({
          id: u.id,
          fullName: u.name,
          email: u.email,
          role: u.role === 'TEAM_LEADER' ? 'Team Leader' : u.role === 'MENTOR' ? 'Mentor' : 'Student',
          collegeName: u.collegeName || '',
          department: u.department || 'Computer Science & Engineering',
          status: 'Active',
          team: u.team || 'Not Assigned'
        }));

        calculateProfile(mappedUsers, allProjects);
      } catch (err) {
        console.warn('Failed to load fresh profile data from backend:', err);
      }
    }
    loadFreshProfile();
  }, []);

  // Edit / Password Mode: 'view' | 'edit' | 'password'
  const [viewMode, setViewMode] = useState('view');

  // Input states
  const [editForm, setEditForm] = useState({ ...profileData });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Success / Error alerts
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Sync edits on reset/load
  useEffect(() => {
    setEditForm({ ...profileData });
  }, [profileData]);

  // Clear alerts automatically
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ type: '', message: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Validations
    if (!editForm.name.trim()) {
      setFeedback({ type: 'error', message: 'Name field cannot be left blank.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      setFeedback({ type: 'error', message: 'Please specify a valid email address.' });
      return;
    }

    const updatedProfile = { ...editForm };
    
    // Save to backend database!
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userRecordIndex = registeredUsers.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
        
        if (userRecordIndex !== -1) {
          const userRecord = registeredUsers[userRecordIndex];
          const dbId = userRecord.id || user.id;

          // Map role string to backend enum
          const roleLabelStr = userRecord.role || user.role || 'Student';
          const backendRole = roleLabelStr === 'Team Leader' || roleLabelStr === 'TEAM_LEADER' ? 'TEAM_LEADER' :
                              roleLabelStr === 'Mentor' || roleLabelStr === 'MENTOR' ? 'MENTOR' : 'STUDENT';

          // Update backend profile
          await api.updateUserProfile(dbId, {
            name: updatedProfile.name,
            email: updatedProfile.email,
            role: backendRole,
            department: updatedProfile.department,
            team: userRecord.team || 'Not Assigned',
            collegeName: updatedProfile.college
          });

          // Sync registeredUsers in localStorage
          userRecord.fullName = updatedProfile.name;
          userRecord.email = updatedProfile.email;
          userRecord.collegeName = updatedProfile.college;
          userRecord.department = updatedProfile.department;
          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

          // Dispatch storage event to trigger real-time updates across pages
          const storageEvent = new StorageEvent('storage', {
            key: 'registeredUsers',
            newValue: JSON.stringify(registeredUsers),
            storageArea: localStorage
          });
          window.dispatchEvent(storageEvent);
        }
      }
    } catch (dbErr) {
      console.error("Failed to update user profile in backend database:", dbErr);
      setFeedback({ type: 'error', message: 'Failed to update profile on backend database. Please try again.' });
      return;
    }

    setProfileData(updatedProfile);

    // Send profile update notification to user
    const changedFields = [];
    if (updatedProfile.name !== profileData.name) changedFields.push('name');
    if (updatedProfile.email !== profileData.email) changedFields.push('email');
    if (updatedProfile.college !== profileData.college) changedFields.push('college/university');
    if (updatedProfile.department !== profileData.department) changedFields.push('department');

    if (changedFields.length > 0) {
      try {
        await addNotification(
          'Profile Updated',
          `Your profile details (${changedFields.join(', ')}) have been successfully updated.`,
          updatedProfile.email,
          null,
          'info'
        );
      } catch (notifErr) {
        console.warn('Failed to send profile update notification:', notifErr);
      }
    }
    
    // Save to localStorage currentUser
    try {
      const storedUser = localStorage.getItem('currentUser');
      const currentUser = storedUser ? JSON.parse(storedUser) : {};
      const updatedUser = {
        ...currentUser,
        fullName: updatedProfile.name,
        email: updatedProfile.email,
        collegeName: updatedProfile.college,
        department: updatedProfile.department
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      const storageEvent = new StorageEvent('storage', {
        key: 'currentUser',
        newValue: JSON.stringify(updatedUser),
        storageArea: localStorage
      });
      window.dispatchEvent(storageEvent);
    } catch (err) {
      console.error("Failed to update localStorage currentUser", err);
    }

    setViewMode('view');
    setFeedback({ type: 'success', message: 'Your profile has been updated successfully.' });
  };

  const handleSavePassword = (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      setFeedback({ type: 'error', message: 'Please specify your current credentials.' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setFeedback({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({ type: 'error', message: 'Confirm password must match your new password.' });
      return;
    }

    // Send credentials change notification to user
    try {
      const email = profileData.email;
      if (email) {
        addNotification(
          'Credentials Changed',
          'Your password has been successfully updated.',
          email,
          null,
          'warning'
        );
      }
    } catch (notifErr) {
      console.warn('Failed to send password update notification:', notifErr);
    }

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setViewMode('view');
    setFeedback({ type: 'success', message: 'Your login credentials have been updated.' });
  };

  // Render view card
  const renderProfileView = () => {
    const isAdmin = currentPage === 'admin';
    return (
      <div className="p-6 sm:p-8 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 blur-2xl pointer-events-none rounded-full ${
          isAdmin ? 'bg-primary/10' : 'bg-secondary/15'
        }`} />

        {/* Avatar */}
        <div className={`flex-shrink-0 w-24 h-24 rounded-full border-2 bg-slate-500/5 flex items-center justify-center shadow-md select-none ${
          isAdmin ? 'border-primary/30 text-primary' : 'border-secondary/30 text-secondary'
        }`}>
          {isAdmin ? <FiShield className="w-10 h-10" /> : <FiUser className="w-10 h-10" />}
        </div>

        {/* Information layout */}
        <div className="flex-grow space-y-6 text-center md:text-left w-full">
          <div>
            <h3 className="text-xl font-extrabold text-brand-text mb-1 tracking-tight">
              {profileData.name}
            </h3>
            <span className={`text-xs font-bold uppercase tracking-widest block ${
              isAdmin ? 'text-primary' : 'text-secondary'
            }`}>
              {profileData.roleLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isAdmin ? (
              <div className="p-3.5 rounded-xl border border-brand-border bg-slate-50/30 dark:bg-slate-900/10 text-left flex items-center gap-3">
                <FiUser className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                    Username
                  </span>
                  <span className="text-sm font-semibold text-brand-text">
                    {profileData.username}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="p-3.5 rounded-xl border border-brand-border bg-slate-50/30 dark:bg-slate-900/10 text-left flex items-center gap-3">
              <FiMail className="w-5 h-5 text-secondary flex-shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                  Email Address
                </span>
                <span className="text-sm font-semibold text-brand-text">
                  {profileData.email}
                </span>
              </div>
            </div>

            {!isAdmin && (
              <>
                <div className="p-3.5 rounded-xl border border-brand-border bg-slate-50/30 dark:bg-slate-900/10 text-left flex items-center gap-3">
                  <FiAward className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                      Current Team
                    </span>
                    <span className="text-xs font-semibold text-brand-text">
                      {profileData.team}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-brand-border bg-slate-50/30 dark:bg-slate-900/10 text-left flex items-center gap-3">
                  <FiBookOpen className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                      College / University
                    </span>
                    <span className="text-xs font-semibold text-brand-text">
                      {profileData.college}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-brand-border bg-slate-50/30 dark:bg-slate-900/10 text-left flex items-center gap-3">
                  <FiUser className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                      Department
                    </span>
                    <span className="text-xs font-semibold text-brand-text">
                      {profileData.department}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-brand-border bg-slate-50/30 dark:bg-slate-900/10 text-left flex items-center gap-3 sm:col-span-2">
                  <FiShield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                      Projects Assigned
                    </span>
                    <span className="text-xs font-semibold text-brand-text block">
                      {profileData.projectsCount} Active Project{profileData.projectsCount === 1 ? '' : 's'}
                    </span>
                    {profileData.projectsList && profileData.projectsList.length > 0 && (
                      <span className="text-[10px] font-bold text-brand-text-muted block mt-1 select-none">
                        Assigned: {profileData.projectsList.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-start">
            <button
              onClick={() => setViewMode('edit')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/15 border border-primary/20 text-primary font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiEdit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setViewMode('password')}
              className="px-5 py-3 rounded-xl border border-brand-border bg-transparent text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiKey className="w-4 h-4" />
              <span>Change Password</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Edit Form
  const renderProfileEditForm = () => {
    const isAdmin = currentPage === 'admin';
    return (
      <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-6 max-w-2xl animate-scale-up text-left">
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text pb-2 border-b border-brand-border/40">
          Edit Profile Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Name Field */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={editForm.email}
              onChange={handleEditChange}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
              required
            />
          </div>

          {isAdmin && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={editForm.username}
                onChange={handleEditChange}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
              />
            </div>
          )}

          {!isAdmin && (
            <>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
                  College / University
                </label>
                <input
                  type="text"
                  name="college"
                  value={editForm.college}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={editForm.department}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
                />
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-3 border-t border-brand-border/40 justify-end">
          <button
            type="button"
            onClick={() => setViewMode('view')}
            className="px-5 py-2.5 rounded-xl border border-brand-border text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <FiX className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <FiCheck className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    );
  };

  // Render Password Form
  const renderPasswordChangeForm = () => {
    return (
      <form onSubmit={handleSavePassword} className="p-6 sm:p-8 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-6 max-w-md animate-scale-up text-left">
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text pb-2 border-b border-brand-border/40">
          Change Credentials
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="Min 8 characters"
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2 block">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Re-enter new password"
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
              required
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-3 border-t border-brand-border/40 justify-end">
          <button
            type="button"
            onClick={() => setViewMode('view')}
            className="px-5 py-2.5 rounded-xl border border-brand-border text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <FiX className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <FiCheck className="w-4 h-4" />
            <span>Update Password</span>
          </button>
        </div>
      </form>
    );
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'edit':
        return renderProfileEditForm();
      case 'password':
        return renderPasswordChangeForm();
      case 'view':
      default:
        return renderProfileView();
    }
  };

  return (
    <div className="space-y-6 w-full text-left">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
          Account Profile
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-muted">
          Manage system credentials, verify active registrations, and change portal preferences.
        </p>
      </div>

      {/* Banner / Success Error Feedback Alerts */}
      {feedback.message && (
        <div className={`p-4 rounded-xl border text-sm font-bold flex items-center gap-2 max-w-2xl animate-fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
        }`}>
          {feedback.type === 'success' ? (
            <FiCheck className="w-4 h-4 flex-shrink-0" />
          ) : (
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default Profile;
