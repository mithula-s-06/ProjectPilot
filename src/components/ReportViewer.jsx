import React, { useState, useEffect } from 'react';
import { FiDownload, FiZoomIn, FiZoomOut, FiFileText } from 'react-icons/fi';
import { api } from '../utils/api';

const ReportViewer = ({ report = {} }) => {
  const [zoom, setZoom] = useState(100); // 80, 100, 120
  const [toast, setToast] = useState(null);
  
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null); // 'pdf', 'image', 'text', 'other'
  const [textPreviewContent, setTextPreviewContent] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  const handleZoomIn = () => {
    if (zoom < 120) setZoom(zoom + 20);
  };

  const handleZoomOut = () => {
    if (zoom > 80) setZoom(zoom - 20);
  };

  useEffect(() => {
    let active = true;
    const fileUrl = report.fileUrl;
    const fileId = report.fileId;
    const fileName = report.fileName || '';

    // Cleanup previous object URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewType(null);
    setTextPreviewContent('');
    setPreviewError(null);

    if (!fileUrl || fileUrl === '#') {
      setPreviewType('other');
      return;
    }

    const loadPreview = async () => {
      try {
        setLoadingPreview(true);
        let blob;

        if (fileId || fileUrl.startsWith('http')) {
          blob = await api.downloadFile(fileId || fileUrl);
        } else if (fileUrl.startsWith('data:')) {
          const parts = fileUrl.split(';base64,');
          const contentType = parts[0].split(':')[1];
          const raw = window.atob(parts[1]);
          const rawLength = raw.length;
          const uInt8Array = new Uint8Array(rawLength);
          for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
          }
          blob = new Blob([uInt8Array], { type: contentType });
        } else {
          throw new Error('Invalid file source');
        }

        if (!active) return;

        const mime = blob.type.toLowerCase();
        const objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);

        if (mime.startsWith('image/')) {
          setPreviewType('image');
        } else if (mime === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
          setPreviewType('pdf');
        } else if (mime.startsWith('text/')) {
          setPreviewType('text');
          const reader = new FileReader();
          reader.onload = (e) => {
            if (active) setTextPreviewContent(e.target.result);
          };
          reader.readAsText(blob);
        } else {
          setPreviewType('other');
        }
      } catch (err) {
        console.error('Failed to load file preview:', err);
        if (active) {
          setPreviewError('Failed to load document preview.');
          setPreviewType('other');
        }
      } finally {
        if (active) setLoadingPreview(false);
      }
    };

    loadPreview();

    return () => {
      active = false;
    };
  }, [report.fileUrl, report.fileId, report.fileName]);

  const handleDownload = async () => {
    const titleText = report.week || report.title || 'Weekly Report';
    const fileName = report.fileName || 'report.pdf';
    setToast(`Downloading Report: ${titleText} - File: ${fileName}`);
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
      const content = `ProjectPilot Report Document\n\nFile Name: ${fileName}\nReport Subject: ${titleText}\nRemarks: ${report.remarks || 'No remarks provided.'}\n\nThis is a plain page document generated for the report.\n\nCreated on: ${new Date().toLocaleDateString()}`;
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

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md overflow-hidden shadow-md w-full flex flex-col">
      {toast && (
        <div className="p-2.5 bg-emerald-500/15 border-b border-emerald-500/20 text-emerald-500 text-xs font-semibold text-center animate-fade-in">
          {toast}
        </div>
      )}
      
      {/* Viewer toolbar */}
      <div className="px-5 py-3 border-b border-brand-border bg-slate-200/20 dark:bg-slate-800/10 flex items-center justify-between gap-4 select-none">
        
        {/* Document Title info */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-xs font-bold text-brand-text truncate max-w-[200px]">
            {report.fileName || 'Report'}
          </span>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-3">
          
          {/* Zoom controls */}
          <div className="flex items-center gap-1 border border-brand-border rounded-lg p-0.5 bg-slate-50 dark:bg-slate-900/30">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom === 80 || previewType === 'pdf'}
              className="p-1 rounded text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 disabled:opacity-40 focus:outline-none cursor-pointer"
              title="Zoom Out"
            >
              <FiZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-extrabold text-brand-text-muted px-1.5 w-10 text-center">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom === 120 || previewType === 'pdf'}
              className="p-1 rounded text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 disabled:opacity-40 focus:outline-none cursor-pointer"
              title="Zoom In"
            >
              <FiZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-lg border border-brand-border text-brand-text-muted hover:text-cyan-500 hover:bg-cyan-500/5 transition-all duration-300 focus:outline-none cursor-pointer"
            title="Download Original File"
          >
            <FiDownload className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Document View Sheet */}
      <div className="p-6 bg-slate-300 dark:bg-slate-950/60 overflow-auto h-[480px] flex items-center justify-center custom-scrollbar relative">
        {loadingPreview ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <span className="text-xs font-semibold text-brand-text-muted">Loading document preview...</span>
          </div>
        ) : previewType === 'pdf' ? (
          <iframe
            src={`${previewUrl}#toolbar=0`}
            className="w-full h-full border-0 bg-white rounded shadow-2xl"
            title="PDF Preview"
          />
        ) : previewType === 'image' ? (
          <div className="overflow-auto max-w-full max-h-full flex items-center justify-center">
            <img
              src={previewUrl}
              alt={report.fileName}
              className="max-w-full max-h-[440px] object-contain rounded shadow-2xl border border-brand-border/40 transition-transform duration-300"
              style={{ transform: `scale(${zoom / 100})` }}
            />
          </div>
        ) : previewType === 'text' ? (
          <pre 
            className="bg-white text-slate-800 rounded shadow-2xl p-6 max-w-xl w-full text-left font-mono text-xs whitespace-pre-wrap overflow-auto max-h-full border border-slate-300 transition-transform duration-300"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            {textPreviewContent}
          </pre>
        ) : (
          <div className="bg-white text-slate-800 rounded shadow-2xl p-8 max-w-xl w-full text-center min-h-[300px] flex flex-col items-center justify-center border border-slate-300">
            <FiFileText className="w-16 h-16 text-slate-400 mb-4" />
            <h4 className="text-sm font-bold text-slate-800 mb-1">Preview is not available for this file type</h4>
            <p className="text-xs text-slate-500 max-w-xs">
              File: {report.fileName || 'report.pdf'} ({report.fileSize || 'N/A'})
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Please download the original file to view its full content.
            </p>
            <button
              type="button"
              onClick={handleDownload}
              className="mt-5 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-glow transition-all duration-300 hover-lift cursor-pointer"
            >
              Download Original File
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default ReportViewer;
