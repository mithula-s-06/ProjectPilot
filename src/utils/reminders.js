import { api, addNotification } from './api';

export const checkDeadlineReminders = async (projectsList) => {
  try {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    let notificationsList = [];
    try {
      notificationsList = await api.listNotifications() || [];
    } catch (apiErr) {
      console.warn('Failed to fetch notifications list for reminders:', apiErr);
      const storedNotifs = localStorage.getItem('notifications');
      notificationsList = storedNotifs ? JSON.parse(storedNotifs) : [];
    }
    
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);

    for (const p of projectsList) {
      const teamName = p.teamName;
      if (!teamName || teamName === 'Not Assigned') continue;

      // Helper to find users in team
      const isUserInTeam = (user, tName) => {
        if (!user || !user.team || !tName) return false;
        return user.team.split(',').map(t => t.trim().toLowerCase()).includes(tName.toLowerCase());
      };

      // Find Team Leader
      const teamLeader = registeredUsers.find(u => 
        (u.role === 'Team Leader' || u.role === 'TEAM_LEADER') && 
        isUserInTeam(u, teamName)
      );

      // A. Check Tasks
      const tasks = p.tasks || [];
      for (const t of tasks) {
        if (t.status === 'Completed' || !t.deadline) continue;
        
        const deadlineDate = new Date(t.deadline);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Reminder 3 days prior or closer
        if (diffDays >= 0 && diffDays <= 3) {
          // Find assignee user record
          const assignee = registeredUsers.find(u => 
            u.name?.trim().toLowerCase() === t.student?.trim().toLowerCase() || 
            u.fullName?.trim().toLowerCase() === t.student?.trim().toLowerCase()
          );

          // Send to assignee
          if (assignee) {
            const hasAlreadyNotifiedAssignee = notificationsList.some(n => 
              n.targetEmail?.toLowerCase() === assignee.email.toLowerCase() &&
              n.title === 'Task Deadline Reminder' &&
              n.message.includes(t.name)
            );
            if (!hasAlreadyNotifiedAssignee) {
              await addNotification(
                'Task Deadline Reminder',
                `Reminder: The task "${t.name}" is due in ${diffDays} days (${t.deadline}) and has not been completed.`,
                assignee.email,
                teamName,
                'warning'
              );
            }
          }

          // Send to Team Leader
          if (teamLeader) {
            const hasAlreadyNotifiedLeader = notificationsList.some(n => 
              n.targetEmail?.toLowerCase() === teamLeader.email.toLowerCase() &&
              n.title === 'Task Deadline Reminder' &&
              n.message.includes(t.name) &&
              n.message.includes(t.student || '')
            );
            if (!hasAlreadyNotifiedLeader) {
              await addNotification(
                'Task Deadline Reminder',
                `Reminder: The task "${t.name}" assigned to ${t.student || 'Developer'} is due in ${diffDays} days (${t.deadline}) and is not completed.`,
                teamLeader.email,
                teamName,
                'warning'
              );
            }
          }

          // Send to Mentor
          const mentorName = p.mentor;
          if (mentorName && mentorName !== 'Not Assigned') {
            const mentorUser = registeredUsers.find(u => 
              (u.role === 'Mentor' || u.role === 'MENTOR') && 
              (u.fullName?.trim().toLowerCase() === mentorName.trim().toLowerCase() || u.name?.trim().toLowerCase() === mentorName.trim().toLowerCase())
            );
            const mentorEmail = mentorUser ? mentorUser.email : null;
            if (mentorEmail) {
              const hasAlreadyNotifiedMentor = notificationsList.some(n => 
                n.targetEmail?.toLowerCase() === mentorEmail.toLowerCase() &&
                n.title === 'Task Deadline Reminder' &&
                n.message.includes(t.name)
              );
              if (!hasAlreadyNotifiedMentor) {
                await addNotification(
                  'Task Deadline Reminder',
                  `Reminder: The task "${t.name}" assigned to ${t.student || 'Developer'} in team "${teamName}" is due in ${diffDays} days (${t.deadline}) and is not completed.`,
                  mentorEmail,
                  teamName,
                  'warning'
                );
              }
            }
          }
        }
      }

      // B. Check Milestones
      const milestones = p.milestones || [];
      for (const m of milestones) {
        if (m.status === 'Completed' || !m.dueDate) continue;

        const due = new Date(m.dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 3) {
          // Send to Team Leader
          if (teamLeader) {
            const hasAlreadyNotifiedLeader = notificationsList.some(n => 
              n.targetEmail?.toLowerCase() === teamLeader.email.toLowerCase() &&
              n.title === 'Milestone Deadline Reminder' &&
              n.message.includes(m.name)
            );
            if (!hasAlreadyNotifiedLeader) {
              await addNotification(
                'Milestone Deadline Reminder',
                `Reminder: Milestone "${m.name}" is due in ${diffDays} days (${m.dueDate}) and has not been completed.`,
                teamLeader.email,
                teamName,
                'warning'
              );
            }
          }

          // Send to other Team Members
          const teamUsers = registeredUsers.filter(u => isUserInTeam(u, teamName));
          for (const user of teamUsers) {
            if (teamLeader && user.email.toLowerCase() === teamLeader.email.toLowerCase()) continue;

            const hasAlreadyNotifiedUser = notificationsList.some(n => 
              n.targetEmail?.toLowerCase() === user.email.toLowerCase() &&
              n.title === 'Milestone Deadline Reminder' &&
              n.message.includes(m.name)
            );
            if (!hasAlreadyNotifiedUser) {
              await addNotification(
                'Milestone Deadline Reminder',
                `Reminder: Milestone "${m.name}" is due in ${diffDays} days (${m.dueDate}) and has not been completed.`,
                user.email,
                teamName,
                'warning'
              );
            }
          }

          // Send to Mentor
          const mentorName = p.mentor;
          if (mentorName && mentorName !== 'Not Assigned') {
            const mentorUser = registeredUsers.find(u => 
              (u.role === 'Mentor' || u.role === 'MENTOR') && 
              (u.fullName?.trim().toLowerCase() === mentorName.trim().toLowerCase() || u.name?.trim().toLowerCase() === mentorName.trim().toLowerCase())
            );
            const mentorEmail = mentorUser ? mentorUser.email : null;
            if (mentorEmail) {
              const hasAlreadyNotifiedMentor = notificationsList.some(n => 
                n.targetEmail?.toLowerCase() === mentorEmail.toLowerCase() &&
                n.title === 'Milestone Deadline Reminder' &&
                n.message.includes(m.name)
              );
              if (!hasAlreadyNotifiedMentor) {
                await addNotification(
                  'Milestone Deadline Reminder',
                  `Reminder: Milestone "${m.name}" for team "${teamName}" is due in ${diffDays} days (${m.dueDate}) and has not been completed.`,
                  mentorEmail,
                  teamName,
                  'warning'
                );
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Error checking deadline reminders:', err);
  }
};
