import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiCheck, FiX, FiFileText, FiRefreshCw, FiCpu } from 'react-icons/fi';
import ReportViewer from '../components/ReportViewer';
import FeedbackForm from '../components/FeedbackForm';
import { api } from '../utils/api';

const ReportReview = ({ report, onBack, onUpdateReportStatus, projects }) => {
  const [localReport, setLocalReport] = useState(report);
  const [analyzing, setAnalyzing] = useState(false);
  const [decision, setDecision] = useState(report.status === 'Reviewed' ? 'Approved' : report.status === 'Rejected' ? 'Rejected' : null);
  const [toast, setToast] = useState(null);
  const [feedback, setFeedback] = useState(report.feedback || '');

  useEffect(() => {
    setLocalReport(report);
  }, [report]);

  if (!report) return null;

  const isTaskReport = (() => {
    if (!report) return false;
    const weekLower = (report.week || '').toLowerCase().trim();
    const isWeeklyPattern = /^week\s+\d+$/i.test(weekLower) || weekLower === 'week';
    if (!isWeeklyPattern) return true;

    if (projects) {
      const project = projects.find(p => p.id === report.projectId);
      if (project) {
        return (project.tasks || []).some(t => 
          t.reportDetails && 
          (t.reportDetails.id === report.id || 
           t.reportDetails.fileName === report.fileName ||
           t.reportDetails.week === report.week)
        );
      }
    }
    return false;
  })();

  const handleReanalyze = async () => {
    if (analyzing) return;
    setAnalyzing(true);
    try {
      const updatedProject = await api.reanalyzeWeeklyReport(localReport.projectId, localReport.id);
      if (updatedProject && updatedProject.weeklyReports) {
        const updatedRep = updatedProject.weeklyReports.find(r => r.id === localReport.id);
        if (updatedRep) {
          setLocalReport(prev => ({
            ...prev,
            similarityScore: updatedRep.similarityScore || 0,
            aiGeneratedScore: updatedRep.aiGeneratedScore || 0
          }));
          setToast("AI integrity audit completed successfully!");
        } else {
          setToast("Could not locate updated report in response.");
        }
      } else {
        setToast("Audit completed but failed to parse results.");
      }
    } catch (err) {
      console.error("Re-analysis failed:", err);
      setToast("Failed to run AI audit. Make sure AI microservice is active.");
    } finally {
      setAnalyzing(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDecision = (status) => {
    setDecision(status);
    if (onUpdateReportStatus) {
      onUpdateReportStatus(report.id, report.projectId, status, feedback);
    }
    setToast(`Report status set to: ${status}`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleReassign = () => {
    setDecision('Reassigned');
    setToast('Task marked for Reassignment. Please enter comments and submit below.');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6 w-full text-left animate-fade-in pb-12">
      {toast && (
        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs font-semibold flex items-center justify-between animate-fade-in w-full">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} className="text-brand-text-muted hover:text-brand-text ml-2">×</button>
        </div>
      )}

      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-brand-text-muted hover:text-brand-text uppercase tracking-wider transition-colors duration-300 group focus:outline-none cursor-pointer"
      >
        <FiArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        <span>Back to Reports</span>
      </button>

      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
          Review Report
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-muted">
          Read progress outcomes, verify attached documentation and file recommendations.
        </p>
      </div>

      {/* Two columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Document view (left) */}
        <div className="lg:col-span-7 w-full">
          <ReportViewer report={report} />
        </div>

        {/* Info & Actions (right) */}
        <div className="lg:col-span-5 space-y-6 w-full">
          
          {/* AI Integrity Audit */}
          <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-5">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text pb-2.5 border-b border-brand-border/40 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FiCpu className="w-4 h-4 text-cyan-500" />
                AI Integrity Audit
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReanalyze}
                  disabled={analyzing}
                  title="Re-run AI Audit on this report"
                  className={`p-1.5 rounded-lg border border-brand-border hover:border-cyan-500/30 text-brand-text-muted hover:text-cyan-500 bg-brand-card hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-all ${analyzing ? 'animate-spin' : ''}`}
                >
                  <FiRefreshCw className="w-3.5 h-3.5" />
                </button>
                <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase border ${
                  ((localReport.similarityScore || 0) >= 30 || (localReport.aiGeneratedScore || 0) >= 70)
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                  {((localReport.similarityScore || 0) >= 30 || (localReport.aiGeneratedScore || 0) >= 70) ? 'Flagged' : 'Clear'}
                </span>
              </div>
            </h3>
            
            <div className="space-y-4">
              {/* Semantic Similarity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-extrabold text-brand-text-muted">Semantic Similarity</span>
                  <span className={`font-bold ${(localReport.similarityScore || 0) >= 30 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {localReport.similarityScore || 0}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${(localReport.similarityScore || 0) >= 30 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(localReport.similarityScore || 0, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-brand-text-muted/70 leading-relaxed font-semibold">
                  {(localReport.similarityScore || 0) >= 30 
                    ? "⚠️ Matches other documents in the database. Potential plagiarism." 
                    : "✓ Low similarity. Content appears unique."}
                </p>
              </div>

              {/* AI Detection */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-extrabold text-brand-text-muted">AI-Generated Probability</span>
                  <span className={`font-bold ${(localReport.aiGeneratedScore || 0) >= 70 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {localReport.aiGeneratedScore || 0}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${(localReport.aiGeneratedScore || 0) >= 70 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(localReport.aiGeneratedScore || 0, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-brand-text-muted/70 leading-relaxed font-semibold">
                  {(localReport.aiGeneratedScore || 0) >= 70 
                    ? "⚠️ High probability of AI-generated content (e.g. ChatGPT)." 
                    : "✓ Text characteristics match natural human writing styles."}
                </p>
              </div>
            </div>
          </div>

          {/* Decision Box */}
          <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text pb-2.5 border-b border-brand-border/40">
              Evaluation Decision
            </h3>
            
            <div className="flex gap-4 pt-1">
              {/* Approve */}
              <button
                type="button"
                onClick={() => handleDecision('Approved')}
                className={`flex-1 py-3.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer ${
                  decision === 'Approved'
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-glow-emerald'
                    : 'border-brand-border text-brand-text hover:border-emerald-500/40 hover:bg-emerald-500/5'
                }`}
              >
                <FiCheck className="w-4 h-4" />
                <span>Approve</span>
              </button>

              {/* Reject */}
              <button
                type="button"
                onClick={() => handleDecision('Rejected')}
                className={`flex-1 py-3.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer ${
                  decision === 'Rejected' || decision === 'Reassigned'
                    ? 'border-rose-500 bg-rose-500 text-white shadow-glow-rose'
                    : 'border-brand-border text-brand-text hover:border-rose-500/40 hover:bg-rose-500/5'
                }`}
              >
                <FiX className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>

          {/* Reassign Task Action (only when rejected and it is a task report) */}
          {(decision === 'Rejected' || decision === 'Reassigned') && isTaskReport && (
            <button
              type="button"
              onClick={handleReassign}
              className={`w-full py-3.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer ${
                decision === 'Reassigned'
                  ? 'border-amber-500 bg-amber-500 text-white shadow-glow-amber'
                  : 'border-amber-500/30 text-amber-500 hover:bg-amber-500/5 hover:border-amber-500/50 bg-amber-500/[0.02]'
              }`}
            >
              <FiRefreshCw className={`w-4 h-4 ${decision === 'Reassigned' ? 'animate-spin' : ''}`} />
              <span>Reassign Task</span>
            </button>
          )}

          {/* Feedback Form */}
          <FeedbackForm 
            onSubmitFeedback={(text) => {
              setFeedback(text);
              if (onUpdateReportStatus) {
                onUpdateReportStatus(report.id, report.projectId, decision || 'Approved', text);
              }
              setToast(decision === 'Reassigned' ? 'Task reassigned successfully!' : 'Feedback submitted successfully!');
              setTimeout(() => setToast(null), 3000);
            }} 
          />

        </div>

      </div>

    </div>
  );
};

export default ReportReview;
