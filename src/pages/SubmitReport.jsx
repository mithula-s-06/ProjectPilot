import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiFileText, FiClock, FiAlertCircle, FiCheck, FiUploadCloud, FiTrash2 } from 'react-icons/fi';
import { api } from '../utils/api';
import { fileStorage } from '../utils/fileStorage';

const SubmitReport = ({ task, onBack, onSubmit, isEdit = false, initialData = null }) => {
  const [description, setDescription] = useState(() => isEdit && initialData ? initialData.description : '');
  const [title, setTitle] = useState(() => isEdit && initialData ? initialData.title : '');
  const [commitsCount, setCommitsCount] = useState(() => isEdit && initialData ? String(initialData.commitsCount || 0) : '');
  const [prsCount, setPrsCount] = useState(() => isEdit && initialData ? String(initialData.prsCount || 0) : '');
  const [selectedFiles, setSelectedFiles] = useState(() => {
    if (isEdit && initialData) {
      if (initialData.files && Array.isArray(initialData.files)) {
        return initialData.files.map(f => ({ ...f, isExisting: true, name: f.fileName, size: f.fileSize ? parseFloat(f.fileSize) * 1024 * 1024 : 0 }));
      } else if (initialData.fileName) {
        return [{
          name: initialData.fileName,
          size: initialData.fileSize ? parseFloat(initialData.fileSize) * 1024 * 1024 : 0,
          isExisting: true,
          fileName: initialData.fileName,
          fileSize: initialData.fileSize,
          fileUrl: initialData.fileUrl,
          fileId: initialData.fileId
        }];
      }
    }
    return [];
  });
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit && initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setCommitsCount(initialData.commitsCount !== undefined ? String(initialData.commitsCount) : '');
      setPrsCount(initialData.prsCount !== undefined ? String(initialData.prsCount) : '');
      if (initialData.files && Array.isArray(initialData.files)) {
        setSelectedFiles(initialData.files.map(f => ({ ...f, isExisting: true, name: f.fileName, size: f.fileSize ? parseFloat(f.fileSize) * 1024 * 1024 : 0 })));
      } else if (initialData.fileName) {
        setSelectedFiles([{
          name: initialData.fileName,
          size: initialData.fileSize ? parseFloat(initialData.fileSize) * 1024 * 1024 : 0,
          isExisting: true,
          fileName: initialData.fileName,
          fileSize: initialData.fileSize,
          fileUrl: initialData.fileUrl,
          fileId: initialData.fileId
        }]);
      } else {
        setSelectedFiles([]);
      }
    } else if (!isEdit) {
      setTitle('');
      setDescription('');
      setCommitsCount('');
      setPrsCount('');
      setSelectedFiles([]);
    }
  }, [isEdit, initialData]);

  if (!task) return null;

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-rose-500 bg-rose-500/10 border border-rose-500/20';
      case 'Medium':
        return 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
      case 'Low':
      default:
        return 'text-blue-500 bg-blue-500/10 border border-blue-500/20';
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      if (error) setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      if (error) setError('');
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a report subject / title.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description of what the report means.');
      return;
    }
    if (selectedFiles.length === 0) {
      setError('Please upload at least one report document.');
      return;
    }
    setError('');

    try {
      setUploading(true);

      const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
        if (file instanceof File) {
          const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          // 1. Save to local IndexedDB first
          await fileStorage.saveFile(fileId, file);

          // 2. Try to upload to backend
          try {
            const uploadResult = await api.uploadFile(file);
            await fileStorage.saveFile(uploadResult.id, file);
            return {
              fileName: file.name,
              fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              fileUrl: uploadResult.fileUrl,
              fileId: uploadResult.id
            };
          } catch (uploadErr) {
            console.warn('Backend upload failed, relying on IndexedDB:', uploadErr);
            return {
              fileName: file.name,
              fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              fileUrl: `local-file:${fileId}`,
              fileId: fileId
            };
          }
        }
        return file;
      }));

      onSubmit({
        title: title.trim(),
        description: description,
        commitsCount: parseInt(commitsCount) || 0,
        prsCount: parseInt(prsCount) || 0,
        fileName: uploadedFiles[0]?.fileName || '',
        fileSize: uploadedFiles[0]?.fileSize || '',
        fileUrl: uploadedFiles[0]?.fileUrl || '#',
        fileId: uploadedFiles[0]?.fileId || null,
        files: uploadedFiles
      });
    } catch (err) {
      console.error('File saving/uploading failed:', err);
      setError('Failed to save the file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 w-full text-left max-w-3xl animate-scale-up pb-12">
      
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-brand-text-muted hover:text-brand-text uppercase tracking-wider transition-colors duration-300 group focus:outline-none cursor-pointer"
      >
        <FiArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        <span>Back to Project Details</span>
      </button>

      {error && (
        <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-xs font-semibold animate-fade-in w-full">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
          {isEdit ? 'Edit Progress Report' : 'Submit Progress Report'}
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-muted">
          {isEdit ? 'Modify the details, outcomes, and progress updates relating to your assigned task.' : 'Provide complete details, outcomes, and progress updates relating to your assigned task.'}
        </p>
      </div>

      {/* Task Summary Panel */}
      <div className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-brand-text-muted border-b border-brand-border/40 pb-2.5">
          Related Task Context
        </h3>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-base font-extrabold text-brand-text leading-tight">
              {task.name}
            </h4>
            <div className="flex flex-wrap items-center gap-4 text-xs text-brand-text-muted pt-1">
              <span className="flex items-center gap-1">
                <FiClock className="w-3.5 h-3.5" /> Assigned: {task.assignedDate}
              </span>
              <span className="flex items-center gap-1 text-rose-500/80">
                <FiAlertCircle className="w-3.5 h-3.5" /> Due: {task.deadline}
              </span>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${getPriorityBadgeClass(task.priority)}`}>
              {task.priority} Priority
            </span>
          </div>
        </div>
      </div>

      {/* Report Form Container */}
      <div className="p-6 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Report Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-text-muted uppercase tracking-wider block">
              Report Subject / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={`e.g., Progress Update on ${task.name}`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-4 py-3 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:border-primary/50 transition-all duration-300 text-sm"
            />
          </div>

          {/* Report Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-text-muted uppercase tracking-wider block">
              Report Description & Outcomes <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError('');
              }}
              placeholder="Provide a detailed description of what this report means, progress details, completed task milestones, challenges encountered, or final outcomes..."
              className="w-full p-4 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:border-primary/50 transition-all duration-300 text-sm resize-none"
            />
          </div>

          {/* GitHub Metrics for the Task */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Commits Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-text-muted uppercase tracking-wider block">
                No. of GitHub Commits for this task
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={commitsCount}
                onChange={(e) => setCommitsCount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:border-primary/50 transition-all duration-300 text-sm"
              />
            </div>

            {/* PRs Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-text-muted uppercase tracking-wider block">
                No. of PRs opened for this task
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={prsCount}
                onChange={(e) => setPrsCount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:border-primary/50 transition-all duration-300 text-sm"
              />
            </div>
          </div>

          {/* File Upload Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-text-muted uppercase tracking-wider block">
              Upload Report Documents
            </label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload').click()}
              className="border-2 border-dashed border-brand-border hover:border-primary/50 bg-slate-50/20 dark:bg-slate-900/10 rounded-xl p-6 text-center transition-all duration-300 relative cursor-pointer"
            >
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
              <div className="cursor-pointer space-y-2 block">
                <FiUploadCloud className="w-8 h-8 mx-auto text-brand-text-muted/65" />
                <div className="text-xs font-semibold text-brand-text">
                  <span>Drag & drop files here, or <span className="text-primary hover:underline">browse</span></span>
                </div>
                <p className="text-[10px] text-brand-text-muted">
                  Supports PDF, Documents, Sheets, Images or ZIP (Max 50MB)
                </p>
              </div>
            </div>

            {/* List of uploaded files */}
            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2.5 rounded-xl border border-brand-border bg-slate-50/20 dark:bg-slate-900/10 text-xs">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FiFileText className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span className="truncate text-brand-text font-medium" title={file.name}>
                        {file.name}
                      </span>
                      <span className="text-[10px] text-brand-text-muted shrink-0">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveFile(index); }}
                      className="p-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/40">
            <button
              type="button"
              onClick={onBack}
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold uppercase tracking-wider hover:shadow-glow-primary hover-lift transition-all duration-300 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Uploading File...</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>{isEdit ? 'Update Report' : 'Submit Report'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default SubmitReport;
