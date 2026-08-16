import React, { useState, useMemo, useEffect } from 'react';
import { FiFileText, FiCheckCircle, FiClock, FiArrowLeft, FiUsers } from 'react-icons/fi';
import ReportCard from '../components/ReportCard';

const Reports = ({ onReviewReport }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const loggedInMentorName = useMemo(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return currentUser.fullName || currentUser.name || 'Dr. Kumar';
    } catch {
      return 'Dr. Kumar';
    }
  }, []);

  const fetchMentorProjects = () => {
    try {
      const storedProj = localStorage.getItem('projects');
      if (storedProj) {
        const allProj = JSON.parse(storedProj);
        // filter by mentor and also remove combined projects with commas
        const filtered = allProj.filter(p => 
          p.mentor && 
          p.mentor.toLowerCase() === loggedInMentorName.toLowerCase() &&
          p.name &&
          (!p.teamName || !p.teamName.includes(','))
        );
        setProjects(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMentorProjects();
    window.addEventListener('focus', fetchMentorProjects);
    return () => window.removeEventListener('focus', fetchMentorProjects);
  }, [loggedInMentorName]);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  const reports = useMemo(() => {
    if (!selectedProject || !selectedProject.weeklyReports) return [];
    return selectedProject.weeklyReports.map(r => ({
      id: r.id,
      projectId: selectedProject.id,
      teamName: selectedProject.teamName || 'Unassigned Team',
      projectName: selectedProject.name,
      week: r.week || 'Week 1',
      status: r.submissionStatus === 'Submitted' ? 'Pending' : 'Reviewed',
      submittedDate: r.submittedDate || new Date().toISOString().split('T')[0],
      remarks: r.remarks,
      fileName: r.fileName,
      fileSize: r.fileSize,
      fileUrl: r.fileUrl,
      similarityScore: r.similarityScore || 0,
      aiGeneratedScore: r.aiGeneratedScore || 0,
      matchedReportId: r.matchedReportId || ''
    }));
  }, [selectedProject]);

  const totalReports = reports.length;
  const reviewedCount = reports.filter(r => r.status === 'Reviewed').length;
  const pendingCount = reports.filter(r => r.status === 'Pending').length;

  if (selectedProject) {
    return (
      <div className="space-y-6 w-full text-left animate-fade-in">
        
        {/* Back button */}
        <button
          type="button"
          onClick={() => setSelectedProjectId(null)}
          className="flex items-center gap-2 text-xs font-bold text-brand-text-muted hover:text-brand-text uppercase tracking-wider transition-colors duration-300 group focus:outline-none cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Back to Teams list</span>
        </button>

        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
            Weekly Reports: {selectedProject.teamName}
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Project: {selectedProject.name} | Domain: {selectedProject.domain || 'Software Development'}
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
          
          {reports.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-brand-border bg-brand-card/25 text-brand-text-muted text-sm font-semibold select-none">
              No reports submitted by this team yet.
            </div>
          ) : (
            <div className="space-y-4 animate-scale-up">
              {reports.map((rep) => (
                <ReportCard
                  key={rep.id}
                  report={rep}
                  onReview={() => onReviewReport(rep)}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 w-full text-left animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
          Weekly Reports Review Center
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-muted">
          Select one of your assigned teams below to review progress reports, analyze originality, and submit reviews.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-brand-border bg-brand-card/25 text-brand-text-muted text-sm font-semibold select-none">
          No teams assigned to you as a mentor.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const pending = (proj.weeklyReports || []).filter(r => r.submissionStatus === 'Submitted').length;
            return (
              <div
                key={proj.id}
                className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md flex flex-col justify-between hover:shadow-xl transition-all duration-300"
              >
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">
                    {proj.domain || 'Software Development'}
                  </span>
                  <h3 className="text-sm font-extrabold text-brand-text tracking-tight">
                    {proj.teamName}
                  </h3>
                  <div className="space-y-1.5 pt-2 border-t border-brand-border/40 text-[11px] text-brand-text-muted font-bold">
                    <div>Project Name: <span className="text-brand-text">{proj.name}</span></div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <FiFileText className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-primary">{(proj.weeklyReports || []).length} Reports Submitted</span>
                    </div>
                    {pending > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-500">
                        <FiClock className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                        <span>{pending} Pending Review</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-border/40 mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedProjectId(proj.id)}
                    className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary hover-lift transition-all duration-300 cursor-pointer"
                  >
                    View Reports
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reports;
