import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiUser, FiLayers, FiUsers, FiGithub } from 'react-icons/fi';
import { api } from '../utils/api';
import HealthScoreCard from '../components/HealthScoreCard';
import TaskCard from '../components/TaskCard';
import MilestoneCard from '../components/MilestoneCard';
import WeeklyReportCard from '../components/WeeklyReportCard';
import GithubContributionCard from '../components/GithubContributionCard';
import MentorFeedbackCard from '../components/MentorFeedbackCard';

const ProjectDetails = ({ project, onBack, onNavigateToSubmitReport, onNavigateToEditReport, onSubmitWeeklyReport, onUpdateTasks }) => {
  if (!project) return null;

  const [dynamicFeedback, setDynamicFeedback] = useState(project.mentorFeedback || { latestFeedback: 'No feedback submitted yet.', date: '--', allComments: [] });

  const handleUpdateHealth = async (newHealth) => {
    try {
      const updatedProj = {
        ...project,
        health: newHealth
      };
      
      if (updatedProj.healthDetails) {
        const scores = [...(updatedProj.healthDetails.scores || [])];
        if (scores.length > 0) {
          scores[scores.length - 1] = newHealth;
        } else {
          scores.push(newHealth);
        }
        updatedProj.healthDetails = {
          ...updatedProj.healthDetails,
          scores: scores
        };
      }

      await api.updateProject(project.id, updatedProj);
      
      const stored = localStorage.getItem('projects');
      if (stored) {
        const allProj = JSON.parse(stored);
        const nextAllProj = allProj.map(p => p.id === project.id ? updatedProj : p);
        localStorage.setItem('projects', JSON.stringify(nextAllProj));
        window.dispatchEvent(new Event('storage'));
      }
      
      window.location.reload();
    } catch (err) {
      console.error('Failed to update health score:', err);
    }
  };

  useEffect(() => {
    async function loadDynamicSuggestions() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userEmail = (currentUser.email || '').trim().toLowerCase();
        const userRole = currentUser.role || '';
        const isLeader = userRole === 'TEAM_LEADER' || userRole === 'Team Leader';

        let list = [];
        if (isLeader && project.teamName) {
          list = await api.getSuggestionsByTeam(project.teamName) || [];
        } else if (userEmail) {
          list = await api.getSuggestionsByRecipient(userEmail) || [];
        }

        const suggestionComments = list.map(s => ({
          id: s.id,
          author: s.mentorName || 'Mentor',
          date: s.date || '--',
          text: `[Directive for ${s.recipientName || 'Member'}]: ${s.text}`
        }));

        const currentComments = project.mentorFeedback?.allComments || [];
        const combined = [...suggestionComments, ...currentComments];
        const uniqueComments = [];
        const seenIds = new Set();
        combined.forEach(c => {
          if (c && c.id && !seenIds.has(c.id)) {
            seenIds.add(c.id);
            uniqueComments.push(c);
          }
        });

        setDynamicFeedback({
          latestFeedback: uniqueComments[0]?.text || project.mentorFeedback?.latestFeedback || 'No feedback submitted yet.',
          date: uniqueComments[0]?.date || project.mentorFeedback?.date || '--',
          allComments: uniqueComments
        });

      } catch (err) {
        console.warn('Failed to load dynamic suggestions in project details:', err);
      }
    }
    loadDynamicSuggestions();
  }, [project]);

  const getTeamName = () => {
    if (project.teamName) return project.teamName;
    const nameLower = project.name.toLowerCase();
    if (nameLower.includes('attendance')) return 'Team Alpha';
    if (nameLower.includes('segmentation')) return 'Team Beta';
    if (nameLower.includes('gateway')) return 'Team Gamma';
    if (nameLower.includes('security')) return 'Team Delta';
    if (nameLower.includes('voting')) return 'Team Omega';

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser && currentUser.team) {
        return currentUser.team;
      }
    } catch (e) {
      console.error(e);
    }
    return 'Not Assigned';
  };

  return (
    <div className="space-y-6 w-full text-left animate-fade-in pb-12">
      
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-brand-text-muted hover:text-brand-text uppercase tracking-wider transition-colors duration-300 group focus:outline-none cursor-pointer"
      >
        <FiArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        <span>Back to Projects</span>
      </button>

      {/* Main Top Header Block */}
      <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">
              {project.domain}
            </span>
            <h2 className="text-2xl font-extrabold text-brand-text tracking-tight">
              {project.name}
            </h2>
            <p className="text-xs text-brand-text-muted max-w-2xl leading-relaxed mt-1">
              {project.description}
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-1.5 flex-shrink-0">
            <span className="text-xs font-bold text-brand-text-muted flex items-center gap-1.5">
              <FiLayers className="w-4 h-4 text-primary" /> Phase: <strong className="text-brand-text">{project.phase}</strong>
            </span>
            <span className="text-xs font-bold text-brand-text-muted flex items-center gap-1.5">
              <FiUser className="w-4 h-4 text-secondary" /> Mentor: <strong className="text-brand-text">{!project.mentor ? 'Not Assigned' : project.mentor}</strong>
            </span>
            <span className="text-xs font-bold text-brand-text-muted flex items-center gap-1.5">
              <FiUsers className="w-4 h-4 text-emerald-500" /> Project: <strong className="text-brand-text">{project.name}</strong>
            </span>
          </div>
        </div>


      </div>

      {/* 7 Expandable Panels Stack (Exact Requested Order) */}
      <div className="space-y-6">

        {/* GitHub Repository Link Section */}
        <div className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md hover:border-primary/20 hover:shadow-glow-primary/5 transition-all duration-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <FiGithub className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-xs sm:text-sm font-extrabold text-brand-text tracking-wide uppercase">
              GitHub Repository
            </span>
          </div>
          {project.github && project.github.repoUrl ? (
            <a
              href={project.github.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-bold text-primary hover:underline hover:text-secondary truncate max-w-[200px] sm:max-w-md transition-colors duration-300"
              title={project.github.repoUrl}
            >
              {project.github.repoUrl}
            </a>
          ) : (
            <span className="text-xs font-bold text-brand-text-muted italic">
              Not Configured
            </span>
          )}
        </div>
        
        {/* Section 1: Health Score */}
        <HealthScoreCard health={project.health} healthDetails={project.healthDetails} onUpdateHealth={handleUpdateHealth} />





        {/* Section 3: My Tasks */}
        <TaskCard 
          initialTasks={(() => {
            try {
              const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
              const isMentor = currentUser.role === 'Mentor';
              if (!isMentor) {
                const userName = (currentUser.fullName || currentUser.name || '').trim().toLowerCase();
                return (project.tasks || []).filter(t => t.student && t.student.trim().toLowerCase() === userName);
              }
            } catch (e) {
              console.error(e);
            }
            return project.tasks || [];
          })()} 
          onNavigateToSubmitReport={onNavigateToSubmitReport} 
          onNavigateToEditReport={onNavigateToEditReport}
          onUpdateTasks={(updatedSubtasks) => {
            const allTasks = project.tasks || [];
            const mergedTasks = allTasks.map(t => {
              const match = updatedSubtasks.find(ut => ut.id === t.id);
              return match ? match : t;
            });
            if (onUpdateTasks) {
              onUpdateTasks(mergedTasks);
            }
          }}
        />

        {/* Section 4: Upcoming Milestones */}
        <MilestoneCard milestones={project.milestones} />

        {/* Section 5 & 6: Weekly Reports & GitHub (Side-by-side on desktop, stacked on mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <WeeklyReportCard 
            weeklyReports={project.weeklyReports} 
            projectStatus={project.status} 
            onSubmitReport={onSubmitWeeklyReport}
          />
          <GithubContributionCard github={project.github} />
        </div>

        {/* Section 7: Mentor Feedback */}
        <MentorFeedbackCard mentorFeedback={dynamicFeedback} />

      </div>

    </div>
  );
};

export default ProjectDetails;
