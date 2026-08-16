import React, { useState } from 'react';
import { FiFileText, FiChevronDown, FiChevronUp, FiDownload, FiCheckCircle, FiClock, FiEye } from 'react-icons/fi';
import { api } from '../utils/api';

const WeeklyReportCard = ({ weeklyReports = [], projectStatus }) => {
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState(null);

  // Find latest report submission
  const latestReport = weeklyReports[weeklyReports.length - 1] || {};

  const handleDownload = async (report) => {
    const titleText = report.week || report.title || 'Weekly Report';
    const fileName = report.fileName || 'report.pdf';
    setToast(`Downloading Weekly Report: ${titleText} - File: ${fileName}`);
    setTimeout(() => setToast(null), 3500);

    const fileUrl = report.fileUrl;
    const fileId = report.fileId;

    if (fileId || (fileUrl && fileUrl.startsWith('http'))) {
      try {
        const blob = await api.downloadFile(fileId || fileUrl);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      } catch (err) {
        console.error('Failed to download file from backend:', err);
      }
    }

    if (fileUrl && fileUrl.startsWith('data:')) {
      try {
        const parts = fileUrl.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        
        const blob = new Blob([uInt8Array], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      } catch (err) {
        console.error('Failed to decode base64 file:', err);
      }
    }

    let blob;
    if (fileName.toLowerCase().endsWith('.pdf')) {
      const pdfString = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 150 >>\nstream\nBT\n/F1 16 Tf\n50 750 Td\n(ProjectPilot - Mock Document) Tj\n/F1 12 Tf\n0 -40 Td\n(File: ${fileName}) Tj\n0 -20 Td\n(Subject: ${titleText}) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000313 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n514\n%%EOF`;
      blob = new Blob([pdfString], { type: 'application/pdf' });
    } else {
      const content = `ProjectPilot Weekly Report Document\n\nFile Name: ${fileName}\nReport Subject: ${titleText}\nRemarks: ${report.remarks || 'No remarks provided.'}\n\nThis is a plain page document generated for the weekly report.\n\nCreated on: ${new Date().toLocaleDateString()}`;
      blob = new Blob([content], { type: 'text/plain' });
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleViewFile = (report) => {
    handleDownload(report);
  };

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md overflow-hidden shadow-md transition-all duration-300 h-full flex flex-col justify-between">
      {toast && (
        <div className="p-3 bg-emerald-500/15 border-b border-brand-border/40 text-emerald-500 text-xs font-semibold text-center animate-fade-in w-full">
          {toast}
        </div>
      )}
      <div>
        {/* Header (Always Visible) */}
        <div 
          onClick={() => setExpanded(!expanded)}
          className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-slate-200/20 dark:hover:bg-slate-800/20 transition-colors duration-300 select-none"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FiFileText className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
                Weekly Reports
              </h3>
              <span className="text-xs text-brand-text-muted">Click to view report uploads</span>
            </div>
          </div>

          {/* Right Info */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold text-brand-text block">
                {latestReport.week || 'Week 1'}
              </span>
              <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase border ${
                latestReport.submissionStatus === 'Submitted' 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                {latestReport.submissionStatus || 'Pending'}
              </span>
            </div>
            <div className="text-brand-text-muted">
              {expanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {/* Expandable Panel */}
        {expanded && (
          <div className="px-6 pb-6 pt-2 border-t border-brand-border/40 space-y-4 animate-fade-in max-h-[300px] overflow-y-auto custom-scrollbar text-left">
            
            {/* Scroll List */}
            <div className="space-y-3 pt-2">
              {weeklyReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3.5 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10 flex items-center justify-between hover:border-primary/20 transition-all duration-300"
                >
                  {/* Details */}
                  <div className="space-y-1 text-left flex-grow">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-brand-text">
                        {report.week}
                      </h4>
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[8px] font-bold border ${
                        report.submissionStatus === 'Submitted'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {report.submissionStatus === 'Submitted' ? <FiCheckCircle className="w-2.5 h-2.5" /> : <FiClock className="w-2.5 h-2.5" />}
                        <span>{report.submissionStatus}</span>
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-brand-text-muted">
                      {report.remarks}
                    </p>
                    
                    <span className="text-[9px] text-brand-text-muted/40 font-semibold block">
                      Submitted Date: {report.submittedDate}
                    </span>

                    {/* AI Integrity Audit Metrics */}
                    {report.submissionStatus !== 'Pending' && (report.similarityScore !== undefined || report.aiGeneratedScore !== undefined) && (
                      <div className="mt-2.5 pt-2 border-t border-brand-border/10 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[8px] font-extrabold text-brand-text-muted uppercase block">Similarity Score</span>
                          <span className={`text-[11px] font-extrabold ${(report.similarityScore || 0) >= 50 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>
                            {report.similarityScore || 0}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-extrabold text-brand-text-muted uppercase block">AI Probability</span>
                          <span className={`text-[11px] font-extrabold ${(report.aiGeneratedScore || 0) >= 60 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>
                            {report.aiGeneratedScore || 0}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Weekly Report Feedback Section */}
                    {report.feedback && (
                      <div className="mt-2.5 pt-2 border-t border-brand-border/10 bg-slate-100/10 dark:bg-slate-900/10 p-2.5 rounded-lg border border-brand-border/10">
                        <span className="text-[8px] font-extrabold text-purple-400 uppercase block mb-0.5">Mentor Feedback</span>
                        <p className="text-[10px] text-brand-text-muted italic leading-relaxed">
                          "{report.feedback}"
                        </p>
                      </div>
                    )}
                    {/* Render attachments */}
                    {(() => {
                      const files = report.files && Array.isArray(report.files) ? report.files : (
                        report.fileName ? [{
                          fileName: report.fileName,
                          fileSize: report.fileSize,
                          fileUrl: report.fileUrl,
                          fileId: report.fileId
                        }] : []
                      );
                      return files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 mt-1.5 pt-1.5 border-t border-brand-border/10">
                          <span className="text-[9px] text-primary font-bold truncate max-w-[150px]">
                            Attachment: {file.fileName} ({file.fileSize || 'N/A'})
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDownload(file)}
                              className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-brand-text hover:text-primary border border-brand-border transition-all cursor-pointer"
                              title="Download Attachment"
                            >
                              <FiDownload className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyReportCard;
