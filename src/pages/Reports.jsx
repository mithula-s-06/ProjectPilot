import React, { useState } from 'react';
import { FiFileText, FiCheckCircle, FiClock } from 'react-icons/fi';
import ReportCard from '../components/ReportCard';

const Reports = ({ onReviewReport }) => {
  const [reports, setReports] = useState(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const loggedInMentorName = currentUser.fullName || currentUser.name || 'Dr. Kumar';
      
      const storedProj = localStorage.getItem('projects');
      if (storedProj) {
        const projects = JSON.parse(storedProj);
        const mentorProjects = projects.filter(p => p.mentor && p.mentor.toLowerCase() === loggedInMentorName.toLowerCase());
        
        const activeReports = [];
        mentorProjects.forEach(p => {
          if (p.weeklyReports) {
            p.weeklyReports.forEach(r => {
              activeReports.push({
                id: r.id,
                projectId: p.id,
                teamName: p.teamName || 'Unassigned Team',
                projectName: p.name,
                week: r.week || 'Week 1',
                status: r.submissionStatus === 'Submitted' ? 'Pending' : 'Reviewed',
                submittedDate: r.submittedDate || new Date().toISOString().split('T')[0],
                remarks: r.remarks,
                fileName: r.fileName,
                fileSize: r.fileSize,
                fileUrl: r.fileUrl,
                similarityScore: r.similarityScore || 0,
                aiGeneratedScore: r.aiGeneratedScore || 0
              });
            });
          }
        });
        return activeReports;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  React.useEffect(() => {
    const handleFocus = () => {
      try {
        const storedProj = localStorage.getItem('projects');
        if (storedProj) {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          const loggedInMentorName = currentUser.fullName || currentUser.name || 'Dr. Kumar';
          const projects = JSON.parse(storedProj);
          const mentorProjects = projects.filter(p => p.mentor && p.mentor.toLowerCase() === loggedInMentorName.toLowerCase());
          
          const activeReports = [];
          mentorProjects.forEach(p => {
            if (p.weeklyReports) {
              p.weeklyReports.forEach(r => {
                activeReports.push({
                  id: r.id,
                  projectId: p.id,
                  teamName: p.teamName || 'Unassigned Team',
                  projectName: p.name,
                  week: r.week || 'Week 1',
                  status: r.submissionStatus === 'Submitted' ? 'Pending' : 'Reviewed',
                  submittedDate: r.submittedDate || new Date().toISOString().split('T')[0],
                  remarks: r.remarks,
                  fileName: r.fileName,
                  fileSize: r.fileSize,
                  fileUrl: r.fileUrl,
                  similarityScore: r.similarityScore || 0,
                  aiGeneratedScore: r.aiGeneratedScore || 0
                });
              });
            }
          });
          setReports(activeReports);
        }
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const totalReports = reports.length;
  const reviewedCount = reports.filter(r => r.status === 'Reviewed').length;
  const pendingCount = reports.filter(r => r.status === 'Pending').length;

  return (
    <div className="space-y-6 w-full text-left">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
          Weekly Reports Review Center
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-muted">
          Access sprint documents, evaluate team contributions, and approve weekly submissions.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest block">Total Reports</span>
            <span className="text-xl font-extrabold text-brand-text mt-1 block">{totalReports}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-brand-text-muted">
            <FiFileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest block">Reviewed Reports</span>
            <span className="text-xl font-extrabold text-emerald-500 mt-1 block">{reviewedCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest block">Pending Reports</span>
            <span className="text-xl font-extrabold text-amber-500 mt-1 block">{pendingCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border-amber-500/20">
            <FiClock className="w-5 h-5 animate-pulse" />
          </div>
        </div>

      </div>

      {/* Reports listing */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-brand-text border-b border-brand-border/40 pb-2.5">
          Active Report Submissions
        </h3>
        
        <div className="space-y-4">
          {reports.map((rep) => (
            <ReportCard
              key={rep.id}
              report={rep}
              onReview={() => onReviewReport(rep)}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Reports;
