import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiUser, FiLayers, FiUsers, FiGithub, FiLink, FiFileText } from 'react-icons/fi';
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

  // Aggregate all documents from project settings, tasks, and weekly reports
  const allDocuments = [];
  const seenDocKeys = new Set();

  if (project.documents) {
    project.documents.forEach(doc => {
      const key = doc.fileId || doc.fileUrl || doc.fileName;
      if (key && !seenDocKeys.has(key)) {
        seenDocKeys.add(key);
        allDocuments.push({
          fileName: doc.fileName,
          fileId: doc.fileId,
          fileUrl: doc.fileUrl,
          source: 'Project Settings'
        });
      }
    });
  }

  if (project.tasks) {
    project.tasks.forEach(task => {
      if (task.reportDetails && task.reportDetails.fileName && task.reportDetails.fileUrl) {
        const fileUrl = task.reportDetails.fileUrl;
        let fileId = null;
        if (fileUrl.includes('/download/')) {
          fileId = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
        }
        const key = fileId || fileUrl || task.reportDetails.fileName;
        if (key && !seenDocKeys.has(key)) {
          seenDocKeys.add(key);
          allDocuments.push({
            fileName: task.reportDetails.fileName,
            fileId: fileId,
            fileUrl: fileUrl,
            source: `Submission: ${task.name}`
          });
        }
      }
    });
  }

  if (project.weeklyReports) {
    project.weeklyReports.forEach(report => {
      if (report.fileName && report.fileUrl) {
        const fileUrl = report.fileUrl;
        let fileId = null;
        if (fileUrl.includes('/download/')) {
          fileId = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
        }
        const key = fileId || fileUrl || report.fileName;
        if (key && !seenDocKeys.has(key)) {
          seenDocKeys.add(key);
          allDocuments.push({
            fileName: report.fileName,
            fileId: fileId,
            fileUrl: fileUrl,
            source: `Report: ${report.week || report.title || 'Weekly Report'}`
          });
        }
      }
    });
  }

  // Aggregate all reference links from project settings and tasks
  const allReferenceLinks = [];
  const seenLinks = new Set();

  if (project.referenceLinks) {
    project.referenceLinks.forEach(link => {
      if (link && !seenLinks.has(link)) {
        seenLinks.add(link);
        allReferenceLinks.push({
          url: link,
          source: 'Project Settings'
        });
      }
    });
  }



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
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
              <span className="text-xs font-bold text-brand-text-muted flex items-center gap-1.5">
                <FiUser className="w-4 h-4 text-secondary" /> Mentor: <strong className="text-brand-text">{!project.mentor ? 'Not Assigned' : project.mentor}</strong>
              </span>
              <span className="text-xs font-bold text-brand-text-muted flex items-center gap-1.5">
                <FiUsers className="w-4 h-4 text-emerald-500" /> Project: <strong className="text-brand-text">{project.name}</strong>
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-1.5 flex-shrink-0">
            <span className="text-xs font-bold text-brand-text-muted flex items-center gap-1.5">
              <FiLayers className="w-4 h-4 text-primary" /> Phase: <strong className="text-brand-text">{project.phase}</strong>
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

        {/* Project Documents & Reference Links */}
        {((allDocuments.length > 0) || (allReferenceLinks.length > 0)) && (
          <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-brand-text pb-2.5 border-b border-brand-border/40 flex items-center gap-2">
              <FiFileText className="w-4 h-4 text-primary" />
              Project Resources & Reference Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Documents Column */}
              {allDocuments.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                    Attached Documents ({allDocuments.length})
                  </span>
                  <div className="space-y-2">
                    {allDocuments.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/10 text-xs">
                        <div className="flex flex-col gap-1 truncate max-w-[230px]">
                          <span className="text-brand-text font-semibold flex items-center gap-2 truncate" title={doc.fileName}>
                            <FiFileText className="w-4 h-4 text-primary flex-shrink-0" />
                            {doc.fileName}
                          </span>
                          {doc.source && (
                            <span className="text-[9px] font-bold text-brand-text-muted/65 uppercase tracking-wider pl-6">
                              via {doc.source}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const blob = await api.downloadFile(doc.fileId);
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = doc.fileName;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                            } catch (err) {
                              console.error('Failed to download file:', err);
                              if (doc.fileUrl) {
                                window.open(doc.fileUrl, '_blank');
                              }
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-brand-border bg-brand-card hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold text-brand-text cursor-pointer transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference Links Column */}
              {allReferenceLinks.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                    Reference Links ({allReferenceLinks.length})
                  </span>
                  <div className="space-y-2">
                    {allReferenceLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center p-3 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/10 text-xs">
                        <div className="flex flex-col gap-1 truncate max-w-full">
                          <span className="text-brand-text font-semibold flex items-center gap-2 truncate">
                            <FiLink className="w-4 h-4 text-secondary flex-shrink-0" />
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline hover:text-secondary font-bold truncate transition-colors"
                              title={link.url}
                            >
                              {link.url}
                            </a>
                          </span>
                          {link.source && (
                            <span className="text-[9px] font-bold text-brand-text-muted/65 uppercase tracking-wider pl-6">
                              via {link.source}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
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
        <MilestoneCard 
          milestones={project.milestones} 
          onUpdateMilestones={async (nextMilestones) => {
            try {
              const updatedProj = {
                ...project,
                milestones: nextMilestones
              };
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
              console.error('Failed to update milestones:', err);
            }
          }}
        />

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
