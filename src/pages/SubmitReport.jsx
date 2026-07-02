import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiFileText, FiClock, FiAlertCircle, FiCheck, FiUploadCloud, FiTrash2 } from 'react-icons/fi';

const SubmitReport = ({ task, onBack, onSubmit, isEdit = false, initialData = null }) => {
  const [description, setDescription] = useState(() => isEdit && initialData ? initialData.description : '');
  const [title, setTitle] = useState(() => isEdit && initialData ? initialData.title : '');
  const [selectedFile, setSelectedFile] = useState(() => isEdit && initialData && initialData.fileName ? { name: initialData.fileName, size: initialData.fileSize ? parseFloat(initialData.fileSize) * 1024 * 1024 : 0, isExisting: true } : null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setSelectedFile(initialData.fileName ? { name: initialData.fileName, size: initialData.fileSize ? parseFloat(initialData.fileSize) * 1024 * 1024 : 0, isExisting: true } : null);
    } else if (!isEdit) {
      setTitle('');
      setDescription('');
      setSelectedFile(null);
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
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (error) setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      if (error) setError('');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a report subject / title.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description of what the report means.');
      return;
    }
    if (!selectedFile) {
      setError('Please upload a report document to proceed with submission.');
      return;
    }
    setError('');
    onSubmit({
      title: title.trim(),
      description: description,
      fileName: selectedFile.name,
      fileSize: selectedFile.size && !selectedFile.isExisting ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : (initialData?.fileSize || '1.12 MB'),
      fileUrl: '#'
    });
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

          {/* File Upload Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-text-muted uppercase tracking-wider block">
              Upload Report Document
            </label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-brand-border hover:border-primary/50 bg-slate-50/20 dark:bg-slate-900/10 rounded-xl p-6 text-center transition-all duration-300 relative cursor-pointer"
            >
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                <FiUploadCloud className="w-8 h-8 mx-auto text-brand-text-muted/65" />
                <div className="text-xs font-semibold text-brand-text">
                  {selectedFile ? (
                    <span className="text-primary font-bold">{selectedFile.name}</span>
                  ) : (
                    <span>Drag & drop a file here, or <span className="text-primary hover:underline">browse</span></span>
                  )}
                </div>
                <p className="text-[10px] text-brand-text-muted/60">
                  Supports any document format (PDF, DOCX, XLSX, ZIP, PNG, etc.) {selectedFile && `(${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`}
                </p>
              </label>
              
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                  title="Remove file"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/40">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold uppercase tracking-wider hover:shadow-glow-primary hover-lift transition-all duration-300 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FiCheck className="w-4 h-4" />
              <span>{isEdit ? 'Update Report' : 'Submit Report'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default SubmitReport;
