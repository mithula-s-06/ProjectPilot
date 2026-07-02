import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiCpu, FiUser, FiClock } from 'react-icons/fi';

const ChatGuru = () => {
  const [userRole, setUserRole] = useState('Student');
  const [userName, setUserName] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const [currentSessionId, setCurrentSessionId] = useState(() => `sess-${Date.now()}`);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sessions, setSessions] = useState(() => {
    try {
      const stored = localStorage.getItem('chatSessions');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  useEffect(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setUserRole(currentUser.role || 'Student');
      setUserName(currentUser.fullName || currentUser.name || 'User');
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    // Check if there is an active session currently running
    if (messages.length <= 1) {
      const defaultGreeting = {
        id: 'init-msg',
        sender: 'guru',
        text: `Hello ${userName}! I am **Chat Guru**, your dedicated project mentoring assistant. How can I help you navigate your tasks, milestones, or evaluations today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([defaultGreeting]);
    }
  }, [userName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getSuggestions = () => {
    if (userRole === 'Mentor') {
      return [
        { label: "Analyze project repository", q: "Analyze project repository" },
        { label: "List high risk teams", q: "List high risk teams" },
        { label: "Summarize report", q: "Summarize report" }
      ];
    } else if (userRole === 'Team Leader') {
      return [
        { label: "Analyze my GitHub repo", q: "Analyze my GitHub repo" },
        { label: "What to do next with the project", q: "What to do next with the project" },
        { label: "Summarize team members activity", q: "Summarize team members activity" }
      ];
    } else {
      return [
        { label: "What to do next with my task", q: "Analyze my team's GitHub repository and suggest my next steps" },
        { label: "Analyze my GitHub repo", q: "Analyze my team's GitHub repository and suggest my next steps" },
        { label: "Check report approval", q: "How do I know if my task report was approved?" }
      ];
    }
  };

  const getStudentTaskAnalysis = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
      const myTeamName = myUserRecord ? myUserRecord.team : 'Not Assigned';
      
      const allProj = JSON.parse(localStorage.getItem('projects') || '[]');
      if (myTeamName && myTeamName !== 'Not Assigned') {
        const p = allProj.find(proj => 
          (proj.teamName && proj.teamName.toLowerCase() === myTeamName.toLowerCase()) ||
          (proj.name && proj.name.toLowerCase().includes(myTeamName.toLowerCase()))
        );
        if (p) {
          const userName = (currentUser.fullName || currentUser.name || '').trim().toLowerCase();
          const myTasks = (p.tasks || []).filter(t => t.student && t.student.trim().toLowerCase() === userName);
          const pendingTasks = myTasks.filter(t => t.status !== 'Completed');
          const commits = p.github?.commits || 0;
          const prs = p.github?.prs || 0;
          const repoUrl = p.github?.repoUrl || 'Not Configured';

          let text = `### GitHub Repository & Task Analysis\n`;
          text += `* **Repository:** ${repoUrl}\n`;
          text += `* **Activity Metrics:** ${commits} Commits, ${prs} Pull Requests detected.\n\n`;

          if (pendingTasks.length > 0) {
            text += `I found **${pendingTasks.length} pending task(s)** assigned to you:\n`;
            pendingTasks.forEach(t => {
              text += `* **${t.name}** (Priority: ${t.priority}, Due: ${t.deadline})\n`;
            });
            text += `\n**Based on my analysis of the GitHub repository, here are your next steps:**\n`;
            pendingTasks.forEach((t, idx) => {
              text += `${idx + 1}. **Implement Code:** Continue developing features for **${t.name}** locally.\n`;
              text += `${idx + 1 + pendingTasks.length}. **Push Code:** Push your commits to GitHub (which will increment your commit count of **${commits}**).\n`;
              text += `${idx + 1 + pendingTasks.length * 2}. **Open PR:** Submit a Pull Request on GitHub and seek review from your team leader.\n`;
              text += `${idx + 1 + pendingTasks.length * 3}. **Submit Report:** Compile your work description, save it as a PDF report, and submit it on the dashboard for your mentor's evaluation.`;
            });
          } else {
            text += `All your assigned tasks are currently marked as **Completed**! Great job maintaining the codebase. You can assist other team members or check upcoming milestones.`;
          }
          return text;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return "I analyzed your GitHub repository and found no active tasks assigned to your name. Please check with your team leader to assign work packages.";
  };

  const getMentorRepoAnalysis = () => {
    try {
      const allProj = JSON.parse(localStorage.getItem('projects') || '[]');
      let text = `### Multi-Team GitHub Repository Analysis\n`;
      allProj.forEach(p => {
        const repo = p.github?.repoUrl || 'Not Configured';
        const commits = p.github?.commits || 0;
        const prs = p.github?.prs || 0;
        text += `* **Team:** ${p.teamName || 'Unassigned'}\n`;
        text += `  * *Repository:* ${repo}\n`;
        text += `  * *Activity:* ${commits} Commits, ${prs} Pull Requests\n`;
      });
      return text;
    } catch (e) {
      console.error(e);
      return "Unable to retrieve GitHub statistics.";
    }
  };

  const getMentorNextSteps = () => {
    try {
      const allProj = JSON.parse(localStorage.getItem('projects') || '[]');
      let pendingReviewsCount = 0;
      let highRiskTeams = [];

      allProj.forEach(p => {
        const pendingReports = (p.weeklyReports || []).filter(r => r.submissionStatus === 'Submitted');
        pendingReviewsCount += pendingReports.length;

        if (p.riskDetails?.riskLevel === 'High Risk' || p.riskDetails?.prediction > 70) {
          highRiskTeams.push(p.teamName || 'Unassigned');
        }
      });

      let text = `### Recommended Next Steps for Mentor\n`;
      if (pendingReviewsCount > 0) {
        text += `1. **Review Pending Submissions:** You have **${pendingReviewsCount} pending report(s)** awaiting your evaluation. Go to the **Reports** section to review and approve/reassign them.\n`;
      } else {
        text += `1. **No Pending Reviews:** All submitted task and weekly reports have been processed!\n`;
      }

      if (highRiskTeams.length > 0) {
        text += `2. **Address High Risk Teams:** Team(s) **${highRiskTeams.join(', ')}** have been flagged with High Risk. Please check their metrics in the **Risk Teams** tab and post advisor recommendations.\n`;
      } else {
        text += `2. **All Teams Stable:** No teams are currently flagged as high risk.\n`;
      }
      return text;
    } catch (e) {
      console.error(e);
      return "Unable to evaluate project next steps.";
    }
  };

  const getTeamMemberActivitySummary = () => {
    try {
      const allProj = JSON.parse(localStorage.getItem('projects') || '[]');
      let text = `### Team Member Activity & Deliverables Summary\n`;
      
      allProj.forEach(p => {
        text += `* **Team:** ${p.teamName || 'Unassigned'} (${p.name})\n`;
        const tasks = p.tasks || [];
        const completed = tasks.filter(t => t.status === 'Completed').length;
        text += `  * *Task Status:* ${completed} / ${tasks.length} tasks completed\n`;
        
        const studentTasks = {};
        tasks.forEach(t => {
          if (t.student) {
            if (!studentTasks[t.student]) studentTasks[t.student] = { total: 0, completed: 0 };
            studentTasks[t.student].total++;
            if (t.status === 'Completed') studentTasks[t.student].completed++;
          }
        });

        Object.keys(studentTasks).forEach(stud => {
          text += `    * **${stud}:** ${studentTasks[stud].completed} / ${studentTasks[stud].total} tasks done\n`;
        });
      });
      return text;
    } catch (e) {
      console.error(e);
      return "Unable to summarize team activity.";
    }
  };

  const getMentorHighRiskTeams = () => {
    try {
      const allProj = JSON.parse(localStorage.getItem('projects') || '[]');
      const highRisk = allProj.filter(p => p.riskDetails?.riskLevel === 'High Risk' || p.riskDetails?.prediction > 70);
      if (highRisk.length === 0) {
        return "### High Risk Teams Diagnostic\nNo teams are currently flagged as High Risk! All projects show stable activity.";
      }
      let text = `### High Risk Teams Diagnostic\nI found **${highRisk.length} team(s)** flagged with high risk:\n`;
      highRisk.forEach(p => {
        text += `* **Team:** ${p.teamName || 'Unassigned'} (${p.name})\n`;
        text += `  * *Risk Level:* ${p.riskDetails?.riskLevel} (AI score: ${p.riskDetails?.prediction}%)\n`;
        text += `  * *Reason:* ${p.riskDetails?.reason || 'Low commit rates/missing report submissions.'}\n`;
      });
      return text;
    } catch (e) {
      console.error(e);
      return "Unable to retrieve risk indicators.";
    }
  };

  const getMentorReportSummary = () => {
    try {
      const allProj = JSON.parse(localStorage.getItem('projects') || '[]');
      let text = `### Weekly & Task Report Submission Summary\n`;
      allProj.forEach(p => {
        const weekly = p.weeklyReports || [];
        const pendingWeekly = weekly.filter(w => w.submissionStatus === 'Submitted').length;
        const approvedWeekly = weekly.filter(w => w.status === 'Approved').length;
        
        const tasks = p.tasks || [];
        const pendingTasks = tasks.filter(t => t.reportDetails?.status === 'Pending').length;
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;

        text += `* **Team:** ${p.teamName || 'Unassigned'}\n`;
        text += `  * *Weekly Reports:* ${approvedWeekly} approved, ${pendingWeekly} pending review\n`;
        text += `  * *Task Reports:* ${completedTasks} completed/approved, ${pendingTasks} pending review\n`;
      });
      return text;
    } catch (e) {
      console.error(e);
      return "Unable to retrieve report summary.";
    }
  };

  const getTeamLeaderRepoAnalysis = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
      const myTeamName = myUserRecord ? myUserRecord.team : 'Not Assigned';
      
      const allProj = JSON.parse(localStorage.getItem('projects') || '[]');
      if (myTeamName && myTeamName !== 'Not Assigned') {
        const p = allProj.find(proj => 
          (proj.teamName && proj.teamName.toLowerCase() === myTeamName.toLowerCase()) ||
          (proj.name && proj.name.toLowerCase().includes(myTeamName.toLowerCase()))
        );
        if (p) {
          const repo = p.github?.repoUrl || 'Not Configured';
          const commits = p.github?.commits || 0;
          const prs = p.github?.prs || 0;
          return `### GitHub Repository Analysis for ${myTeamName}\n* **Repository:** ${repo}\n* **Team Codebase Activity:** ${commits} Commits, ${prs} Pull Requests created.`;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return "GitHub integration details not found for your team.";
  };

  const getTeamLeaderNextSteps = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
      const myTeamName = myUserRecord ? myUserRecord.team : 'Not Assigned';
      
      const allProj = JSON.parse(localStorage.getItem('projects') || '[]');
      if (myTeamName && myTeamName !== 'Not Assigned') {
        const p = allProj.find(proj => 
          (proj.teamName && proj.teamName.toLowerCase() === myTeamName.toLowerCase()) ||
          (proj.name && proj.name.toLowerCase().includes(myTeamName.toLowerCase()))
        );
        if (p) {
          const pendingTasks = (p.tasks || []).filter(t => t.status !== 'Completed');
          const pendingMilestones = (p.milestones || []).filter(m => m.status !== 'Completed');
          
          let text = `### Team Leader Action Plan\n`;
          if (pendingTasks.length > 0) {
            text += `* **Pending Tasks:** There are **${pendingTasks.length} task(s)** currently in progress or pending. Ensure your team members submit their deliverables.\n`;
          } else {
            text += `* **Tasks Status:** Excellent! All assigned member tasks are completed.\n`;
          }
          if (pendingMilestones.length > 0) {
            const nextMile = pendingMilestones[0];
            text += `* **Next Milestone:** **${nextMile.name}** is pending (Due: ${nextMile.dueDate}).\n`;
          }
          text += `* **Weekly Report:** Remember to submit your weekly progress updates in the **Weekly Reports** tab for your mentor's evaluation.`;
          return text;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return "Please inspect your sidebar tabs to view pending tasks and roadmap milestones.";
  };

  const getTeamLeaderMemberSummary = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const myUserRecord = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
      const myTeamName = myUserRecord ? myUserRecord.team : 'Not Assigned';
      
      const allProj = JSON.parse(localStorage.getItem('projects') || '[]');
      if (myTeamName && myTeamName !== 'Not Assigned') {
        const p = allProj.find(proj => 
          (proj.teamName && proj.teamName.toLowerCase() === myTeamName.toLowerCase()) ||
          (proj.name && proj.name.toLowerCase().includes(myTeamName.toLowerCase()))
        );
        if (p) {
          let text = `### ${myTeamName} Activity Summary\n`;
          const tasks = p.tasks || [];
          const completed = tasks.filter(t => t.status === 'Completed').length;
          text += `* **Total Task Progress:** ${completed} / ${tasks.length} completed\n\n`;
          
          const studentTasks = {};
          tasks.forEach(t => {
            if (t.student) {
              if (!studentTasks[t.student]) studentTasks[t.student] = { total: 0, completed: 0 };
              studentTasks[t.student].total++;
              if (t.status === 'Completed') studentTasks[t.student].completed++;
            }
          });

          Object.keys(studentTasks).forEach(stud => {
            text += `* **${stud}:** ${studentTasks[stud].completed} / ${studentTasks[stud].total} tasks done\n`;
          });
          return text;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return "No active team roster found.";
  };

  const getGuruResponse = (query) => {
    const q = query.toLowerCase();
    
    // Mentor Matches
    if (userRole === 'Mentor') {
      if (q.includes('repository') || q.includes('github') || q.includes('repo')) {
        return getMentorRepoAnalysis();
      }
      if (q.includes('risk') || q.includes('predict')) {
        return getMentorHighRiskTeams();
      }
      if (q.includes('summarize') || q.includes('report') || q.includes('review')) {
        return getMentorReportSummary();
      }
    }

    // Team Leader Matches
    if (userRole === 'Team Leader') {
      if (q.includes('github') || q.includes('repo')) {
        return getTeamLeaderRepoAnalysis();
      }
      if (q.includes('next') || q.includes('do next')) {
        return getTeamLeaderNextSteps();
      }
      if (q.includes('activity') || q.includes('member') || q.includes('summarize')) {
        return getTeamLeaderMemberSummary();
      }
      if (q.includes('milestone')) {
        return "To declare a milestone, click **Milestones** in the sidebar, then click **Declare New Milestone**. Enter the name, due date, and priority. Newly declared milestones will populate immediately in the roadmap.";
      }
      if (q.includes('weekly') || q.includes('submit')) {
        return "Click on **Weekly Reports** in the sidebar, input the week number (e.g. 'Week 5'), provide description remarks, attach your pdf report, and submit. The milestone status goes pending until approved by the mentor.";
      }
      if (q.includes('status') || q.includes('toggle') || q.includes('update')) {
        return "Go to the **Tasks** tab in your sidebar. You can click on the status badge of any task card to toggle its state between **Pending**, **In Progress**, and **Completed**.";
      }
    }

    // Student Matches
    if (userRole === 'Student') {
      if (q.includes('github') || q.includes('repo') || q.includes('next') || q.includes('analyze')) {
        return getStudentTaskAnalysis();
      }
      if (q.includes('resubmit') || q.includes('reassigned')) {
        return "To resubmit a reassigned task, go to your **Dashboard** or **Projects** tab, expand the task marked with **Task Reassigned**, click **Submit Report**, and upload your updated PDF file. This clears the warning badge.";
      }
      if (q.includes('approval') || q.includes('know')) {
        return "Check your project's checklist under **My Tasks**. If the status badge for your task is marked **Completed**, it means your report has been successfully approved by your mentor.";
      }
    }

    // Smart mock replies to basically every query based on roles
    if (userRole === 'Student') {
      return `As a Student, I recommend that you check your active assignments and GitHub repository activity. Let me run a quick scan... \n\n${getStudentTaskAnalysis()}`;
    } else if (userRole === 'Team Leader') {
      return `As the Team Leader, your primary responsibility is ensuring your team members push code to the repository and submit their task reports. Here is a status overview:\n* **Milestones:** Review pending milestones.\n* **Weekly Report:** Make sure you submit the weekly report on time in the 'Weekly Reports' section.`;
    } else {
      return `As the Mentor, you have overall supervision. I recommend checking the **Reports** section to review any pending approvals, and the **Risk Teams** section to view AI insights on teams that might need your guidance.`;
    }
  };

  // Autosave current session
  useEffect(() => {
    if (messages.length <= 1) return;
    try {
      const stored = localStorage.getItem('chatSessions');
      const allSessions = stored ? JSON.parse(stored) : [];
      
      const sessionIndex = allSessions.findIndex(s => s.id === currentSessionId);
      const updatedSession = {
        id: currentSessionId,
        date: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        messages: messages,
        preview: messages[messages.length - 1]?.text || ''
      };

      if (sessionIndex !== -1) {
        allSessions[sessionIndex] = updatedSession;
      } else {
        allSessions.unshift(updatedSession);
      }
      localStorage.setItem('chatSessions', JSON.stringify(allSessions));
      setSessions(allSessions);
    } catch (e) {
      console.error(e);
    }
  }, [messages, currentSessionId]);

  const handleStartNewChat = () => {
    setCurrentSessionId(`sess-${Date.now()}`);
    const defaultGreeting = {
      id: 'init-msg',
      sender: 'guru',
      text: `Hello ${userName}! I am **Chat Guru**, your dedicated project mentoring assistant. How can I help you navigate your tasks, milestones, or evaluations today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([defaultGreeting]);
    setHistoryOpen(false);
  };

  const handleLoadSession = (sess) => {
    setCurrentSessionId(sess.id);
    setMessages(sess.messages);
    setHistoryOpen(false);
  };

  const handleDeleteSession = (sessId, e) => {
    e.stopPropagation();
    setDeleteConfirm({
      type: 'chat session',
      message: 'Are you sure you want to delete this chat session?',
      onConfirm: () => {
        try {
          const filtered = sessions.filter(s => s.id !== sessId);
          localStorage.setItem('chatSessions', JSON.stringify(filtered));
          setSessions(filtered);
          if (currentSessionId === sessId) {
            handleStartNewChat();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleSend = (textToSend) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = getGuruResponse(trimmed);
      const guruMessage = {
        id: `guru-${Date.now()}`,
        sender: 'guru',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, guruMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full text-left bg-brand-bg relative animate-fade-in">
      
      {/* Header Banner */}
      <div className="p-4 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-primary text-white shadow-md">
            <FiCpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
              Chat Guru
            </h2>
            <span className="text-[10px] text-brand-text-muted font-bold block">
              Active Virtual Project Pilot Assistant
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative">
          <button
            type="button"
            onClick={() => setHistoryOpen(!historyOpen)}
            className="p-1.5 rounded-lg border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-300 cursor-pointer focus:outline-none flex items-center gap-1.5"
            title="Chat History"
          >
            <FiClock className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">History</span>
          </button>

          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Online
          </span>

          {/* History Dropdown Overlay */}
          {historyOpen && (
            <div className="absolute right-0 top-9 w-64 rounded-xl border border-brand-border bg-brand-card shadow-2xl p-3 z-50 animate-scale-up space-y-2 text-left">
              <div className="flex items-center justify-between pb-1.5 border-b border-brand-border/40">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-text-muted">
                  Saved Sessions
                </span>
                <button
                  type="button"
                  onClick={handleStartNewChat}
                  className="px-2 py-0.5 rounded bg-indigo-500 hover:bg-indigo-600 text-white text-[9px] font-bold uppercase transition-colors cursor-pointer"
                >
                  + New Chat
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar">
                {sessions.length > 0 ? (
                  sessions.map((sess) => (
                    <div
                      key={sess.id}
                      onClick={() => handleLoadSession(sess)}
                      className={`p-2 rounded-lg border cursor-pointer text-xs transition-all flex items-start justify-between gap-2 ${
                        sess.id === currentSessionId
                          ? 'border-indigo-500 bg-indigo-500/5'
                          : 'border-brand-border/40 hover:border-indigo-500/40 hover:bg-slate-200/20 dark:hover:bg-slate-800/20'
                      }`}
                    >
                      <div className="truncate text-left space-y-0.5 flex-grow">
                        <span className="text-[9px] font-bold text-indigo-500 block">
                          {sess.date}
                        </span>
                        <p className="text-brand-text font-semibold truncate leading-tight">
                          {sess.preview.replace(/\*\*/g, '')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(sess.id, e)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold px-1 select-none focus:outline-none"
                        title="Delete Session"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] text-brand-text-muted italic block py-4 text-center">
                    No saved chats found.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat log container */}
      <div className="flex-grow rounded-2xl border border-brand-border bg-brand-card/25 backdrop-blur-xs p-4 overflow-y-auto mb-4 custom-scrollbar space-y-4 font-sans">
        {messages.map((msg) => {
          const isGuru = msg.sender === 'guru';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                isGuru ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'
              }`}
            >
              {/* Avatar Icon */}
              <div className={`p-2 rounded-xl border flex-shrink-0 ${
                isGuru 
                  ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' 
                  : 'bg-primary/10 text-primary border-primary/20'
              }`}>
                {isGuru ? <FiCpu className="w-4 h-4" /> : <FiUser className="w-4 h-4" />}
              </div>

              {/* Message Body */}
              <div className="space-y-1">
                <div className={`p-3 rounded-2xl text-xs sm:text-sm shadow-sm leading-relaxed ${
                  isGuru
                    ? 'bg-brand-card/85 text-brand-text border border-brand-border/60 rounded-tl-none'
                    : 'bg-primary text-white rounded-tr-none'
                }`}>
                  {msg.text.split('\n').map((paragraph, pIdx) => {
                    const formatted = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    return (
                      <p 
                        key={pIdx} 
                        dangerouslySetInnerHTML={{ __html: formatted }}
                        className={pIdx > 0 ? 'mt-1' : ''}
                      />
                    );
                  })}
                </div>
                <span className="text-[9px] text-brand-text-muted/60 font-semibold block px-1">
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-2.5 max-w-[80%] mr-auto">
            <div className="p-2 rounded-xl border bg-indigo-500/10 text-indigo-500 border-indigo-500/20 flex-shrink-0">
              <FiCpu className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-brand-card/85 text-brand-text border border-brand-border/60 rounded-tl-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-brand-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-brand-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-brand-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {getSuggestions().map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(chip.q)}
            className="px-3 py-1.5 rounded-xl border border-brand-border bg-brand-card/45 hover:border-primary/20 hover:bg-slate-200/25 dark:hover:bg-slate-800/25 text-[10px] font-bold text-brand-text-muted hover:text-brand-text transition-all duration-300 cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Message Input Panel */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputValue);
        }}
        className="flex items-center gap-3"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Chat Guru anything..."
          className="flex-grow px-4 py-3 rounded-xl border border-brand-border bg-brand-card/45 text-brand-text focus:outline-none focus:border-primary/50 text-xs sm:text-sm placeholder-brand-text-muted/60"
        />
        <button
          type="submit"
          className="p-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white hover:shadow-glow-primary hover-lift transition-all duration-300 cursor-pointer focus:outline-none flex-shrink-0"
        >
          <FiSend className="w-4 h-4" />
        </button>
      </form>
      
      {deleteConfirm && (
        <>
          <div 
            onClick={() => setDeleteConfirm(null)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] transition-opacity duration-300 animate-fade-in" 
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-[400px] rounded-3xl border border-brand-border bg-brand-card shadow-2xl p-6 z-[10000] text-center animate-scale-up">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-brand-text">
                Confirm Deletion
              </h3>
              <p className="text-xs text-brand-text-muted leading-relaxed max-w-xs">
                {deleteConfirm.message}
              </p>
              <div className="flex items-center gap-3 w-full mt-4">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-brand-border bg-brand-card text-brand-text font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteConfirm.onConfirm();
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white hover:brightness-110 font-bold text-xs uppercase tracking-wider shadow-md transition-all duration-300 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatGuru;
