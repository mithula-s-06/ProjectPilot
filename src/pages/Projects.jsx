import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiCheck, FiChevronLeft, FiChevronRight, FiTrash2, FiPaperclip, FiLink, FiFileText, FiUpload } from 'react-icons/fi';
import { usePage } from '../hooks/usePage';
import ProjectGrid from '../components/ProjectGrid';
import { api, addNotification } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import { fileStorage } from '../utils/fileStorage';

const Projects = ({ projects = [], onViewProject, onAddProject, onEditProject, onDeleteProject }) => {
  const { currentPage } = usePage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectPage, setProjectPage] = useState(1);
  const itemsPerPage = 10;

  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'primary',
    onConfirm: () => {},
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Reset page to 1 when projects array length or dashboard views change
  useEffect(() => {
    setProjectPage(1);
  }, [projects.length, currentPage]);

  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const paginatedProjects = projects.slice((projectPage - 1) * itemsPerPage, projectPage * itemsPerPage);

  const [toast, setToast] = useState(null);
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: '',
    startDate: '',
    endDate: '',
    teamName: '',
    githubUrl: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [referenceLinks, setReferenceLinks] = useState([]);
  const [linkInput, setLinkInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      domain: project.domain,
      description: project.description || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      teamName: project.teamName || '',
      githubUrl: project.github ? project.github.repoUrl || '' : '',
    });
    setExistingDocuments(project.documents || []);
    setReferenceLinks(project.referenceLinks || []);
    setSelectedFiles([]);
    setLinkInput('');
    setModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      domain: '',
      description: '',
      startDate: '',
      endDate: '',
      teamName: '',
      githubUrl: '',
    });
    setExistingDocuments([]);
    setReferenceLinks([]);
    setSelectedFiles([]);
    setLinkInput('');
    setModalOpen(true);
  };

  const handleDeleteClick = (projectId) => {
    if (onDeleteProject) {
      onDeleteProject(projectId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.domain.trim() || !formData.teamName.trim() || !formData.githubUrl.trim()) {
      setToast({ message: 'Project Name, Domain, Team Name, and GitHub Link are required.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Date restrictions
    if (formData.endDate && formData.endDate < todayStr) {
      setToast({ message: 'Expected End Date cannot be in the past. Please select today or a future date.', type: 'error' });
      setTimeout(() => setToast(null), 3500);
      return;
    }

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      setToast({ message: 'Expected End Date cannot be earlier than Expected Start Date.', type: 'error' });
      setTimeout(() => setToast(null), 3500);
      return;
    }

    const actionTitle = editingProject ? 'Update Project Details?' : 'Create New Project?';
    const actionMessage = editingProject 
      ? `Save and apply updates to "${formData.name}"?`
      : `Initialize and declare project "${formData.name}" for "${formData.teamName}"?`;

    setConfirmModalState({
      isOpen: true,
      title: actionTitle,
      message: actionMessage,
      confirmText: editingProject ? 'Save Changes' : 'Create Project',
      cancelText: 'Cancel',
      variant: 'primary',
      onConfirm: async () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));

        // Upload any newly selected files
        let uploadedDocs = [];
        if (selectedFiles.length > 0) {
          setUploading(true);
          try {
            uploadedDocs = await Promise.all(selectedFiles.map(async (file) => {
              try {
                const res = await api.uploadFile(file);
                await fileStorage.saveFile(res.id, file);
                return {
                  fileName: file.name,
                  fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                  fileUrl: res.fileUrl,
                  fileId: res.id
                };
              } catch (uploadErr) {
                console.warn('Backend upload failed for file:', file.name, uploadErr);
                const localId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                await fileStorage.saveFile(localId, file);
                return {
                  fileName: file.name,
                  fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                  fileUrl: `local-file:${localId}`,
                  fileId: localId
                };
              }
            }));
          } catch (err) {
            console.error('File uploads failed:', err);
          } finally {
            setUploading(false);
          }
        }

        const mergedDocuments = [...existingDocuments, ...uploadedDocs];

        // Sync team name back to user profile
        try {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const userIdx = registeredUsers.findIndex(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());

          if (userIdx !== -1) {
            const matchedUser = registeredUsers[userIdx];
            matchedUser.team = formData.teamName.trim();
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            
            currentUser.team = formData.teamName.trim();
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Call backend API to update Team Leader's team in database
            api.updateUserProfile(matchedUser.id, {
              name: matchedUser.fullName || matchedUser.name,
              email: matchedUser.email,
              role: matchedUser.role === 'Team Leader' ? 'TEAM_LEADER' : matchedUser.role === 'Mentor' ? 'MENTOR' : 'STUDENT',
              department: matchedUser.department || 'Computer Science & Engineering',
              team: formData.teamName.trim(),
              collegeName: matchedUser.collegeName || '',
              yearOfStudy: matchedUser.yearOfStudy || '',
              resumeId: matchedUser.resumeId || '',
              resumeName: matchedUser.resumeName || '',
              resumeUrl: matchedUser.resumeUrl || '',
              skills: matchedUser.skills || []
            }).catch(err => console.warn('Failed to sync user profile team to database:', err));
          }
        } catch (err) {
          console.error(err);
        }

        if (editingProject) {
          if (onEditProject) {
            onEditProject({
              ...editingProject,
              name: formData.name,
              domain: formData.domain,
              description: formData.description || 'No description provided.',
              startDate: formData.startDate,
              endDate: formData.endDate,
              teamName: formData.teamName.trim(),
              documents: mergedDocuments,
              referenceLinks: referenceLinks,
              github: {
                ...editingProject.github,
                repoUrl: formData.githubUrl.trim()
              }
            });
          }
          setToast({
            message: `Project "${formData.name}" successfully updated.`,
            type: 'success'
          });
        } else {
          if (onAddProject) {
            onAddProject({
              id: `proj-${Date.now()}`,
              name: formData.name,
              domain: formData.domain,
              description: formData.description || 'No description provided.',
              startDate: formData.startDate,
              endDate: formData.endDate,
              teamName: formData.teamName.trim(),
              phase: 'Planning Phase',
              mentor: 'Not Assigned',
              health: 100,
              progress: 0,
              status: 'Active',
              documents: mergedDocuments,
              referenceLinks: referenceLinks,
              healthDetails: {
                scores: [100],
                months: ['Jun'],
                aiSummary: 'Project is newly declared. Sprints are in planning stages.'
              },
              riskDetails: {
                riskLevel: 'Low Risk',
                factors: [],
                aiExplanation: 'Newly created project. Active indicators are stable.',
                prediction: 0
              },
              tasks: [],
              milestones: [],
              weeklyReports: [],
              github: {
                commits: 0,
                prs: 0,
                issuesClosed: 0,
                contributionPercentage: 100,
                repoUrl: formData.githubUrl.trim()
              },
              mentorFeedback: { latestFeedback: 'New project initialized.', date: '--', allComments: [] }
            });

            // Send notification to Admin that a new team / project has been declared
            try {
              addNotification(
                'New Team & Project Created',
                `Team "${formData.teamName}" created project "${formData.name}" in domain "${formData.domain}".`,
                'admin@pp.edu',
                formData.teamName,
                'info'
              );
            } catch (notifErr) {
              console.warn('Failed to dispatch admin project creation notification:', notifErr);
            }
          }
          setToast({
            message: `Project "${formData.name}" successfully created for "${formData.teamName}".`,
            type: 'success'
          });
        }

        setModalOpen(false);
        setFormData({ name: '', domain: '', description: '', startDate: '', endDate: '', teamName: '', githubUrl: '' });
        setExistingDocuments([]);
        setReferenceLinks([]);
        setSelectedFiles([]);
        setLinkInput('');
        setEditingProject(null);
        setTimeout(() => {
          setToast(null);
        }, 4500);
      }
    });
  };

  const isTeamLeader = currentPage === 'team-leader';

  return (
    <div className="space-y-6 w-full text-left relative">
      
      {/* Title & Add button Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border/40 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
            {currentPage === 'admin' ? 'All Registered Projects' : 'Projects Directory'}
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            {currentPage === 'admin' 
              ? 'View development matrices, track progress rates, and inspect code deliverables.'
              : 'Browse active development tracks, examine milestone statuses, and review repositories.'}
          </p>
        </div>

        {isTeamLeader && (
          <button
            type="button"
            onClick={handleCreateClick}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary hover-lift transition-all duration-300 inline-flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer self-start sm:self-auto"
          >
            <FiPlus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        )}
      </div>

      {/* Grid view of projects */}
      <ProjectGrid 
        projects={paginatedProjects} 
        onViewProject={onViewProject} 
        onEditProject={(isTeamLeader || currentPage === 'admin') ? handleEditClick : null} 
        onDeleteProject={(isTeamLeader || currentPage === 'admin') ? handleDeleteClick : null}
        isTeamLeader={isTeamLeader}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-brand-border/40 text-xs">
          <span className="font-semibold text-brand-text-muted">
            Showing {(projectPage - 1) * itemsPerPage + 1} to {Math.min(projectPage * itemsPerPage, projects.length)} of {projects.length} projects
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setProjectPage(prev => Math.max(prev - 1, 1))}
              disabled={projectPage === 1}
              className="p-2 rounded-lg border border-brand-border text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-brand-text">
              Page {projectPage} of {totalPages}
            </span>
            <button
              onClick={() => setProjectPage(prev => Math.min(prev + 1, totalPages))}
              disabled={projectPage === totalPages}
              className="p-2 rounded-lg border border-brand-border text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {modalOpen && (
        <>
          <div onClick={() => setModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300" />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl border border-brand-border bg-brand-card shadow-2xl p-6 z-50 text-left animate-scale-up custom-scrollbar">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-brand-border mb-5">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-brand-text">
                {editingProject ? 'Edit Project Details' : 'Create New Project'}
              </h3>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. AI-Powered Healthcare Dashboard"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-slate-400 focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1.5">
                  Team Name
                </label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  placeholder="e.g. Team Alpha"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-slate-400 focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1.5">
                  Project Domain / Field
                </label>
                <input
                  type="text"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  placeholder="e.g. AI / Machine Learning"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-slate-400 focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1.5">
                  GitHub Repository Link
                </label>
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/username/repo"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-slate-400 focus:outline-none focus:border-primary/50 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1.5">
                  Project Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your project objectives..."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-slate-400 focus:outline-none focus:border-primary/50 text-sm"
                />
              </div>

              {/* Document Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                  Project Documents
                </label>
                
                {/* Existing attached documents */}
                {existingDocuments.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {existingDocuments.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-brand-border bg-slate-100/50 dark:bg-slate-900/10 text-xs">
                        <span className="text-brand-text font-semibold flex items-center gap-1.5 truncate max-w-[280px]">
                          <FiFileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          {doc.fileName}
                        </span>
                        <button
                          type="button"
                          onClick={() => setExistingDocuments(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Newly selected files */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-brand-border bg-emerald-500/5 text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 truncate max-w-[280px]">
                          <FiUpload className="w-3.5 h-3.5 flex-shrink-0 animate-bounce" />
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <input
                    type="file"
                    id="project-docs"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        setSelectedFiles(prev => [...prev, ...newFiles]);
                      }
                    }}
                  />
                  <label
                    htmlFor="project-docs"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-brand-border hover:border-primary bg-slate-50/30 dark:bg-slate-900/10 text-brand-text-muted hover:text-brand-text text-xs font-bold cursor-pointer transition-colors"
                  >
                    <FiPaperclip className="w-4 h-4" />
                    <span>Upload Documents</span>
                  </label>
                </div>
              </div>

              {/* Reference Links */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">
                  Reference Links
                </label>

                {/* List of links */}
                {referenceLinks.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {referenceLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-brand-border bg-slate-100/50 dark:bg-slate-900/10 text-xs">
                        <span className="text-brand-text font-semibold flex items-center gap-1.5 truncate max-w-[280px]">
                          <FiLink className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                          <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">{link}</a>
                        </span>
                        <button
                          type="button"
                          onClick={() => setReferenceLinks(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    placeholder="https://example.com/resource"
                    className="flex-1 px-4 py-2 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-slate-400 focus:outline-none focus:border-primary/50 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (linkInput.trim() && (linkInput.startsWith('http://') || linkInput.startsWith('https://'))) {
                        setReferenceLinks(prev => [...prev, linkInput.trim()]);
                        setLinkInput('');
                      } else {
                        setToast({ message: 'Please enter a valid link starting with http:// or https://', type: 'error' });
                        setTimeout(() => setToast(null), 3000);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-brand-text font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1.5">
                    Expected Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1.5">
                    Expected End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    min={formData.startDate || todayStr}
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text focus:outline-none focus:border-primary/50 text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-brand-border mt-5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs uppercase tracking-wider transition-colors duration-300 focus:outline-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider hover:shadow-glow-primary transition-all duration-300 flex items-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>{editingProject ? 'Save Changes' : 'Create Project'}</span>
                </button>
              </div>

            </form>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmText={confirmModalState.confirmText}
        cancelText={confirmModalState.cancelText}
        variant={confirmModalState.variant}
        onConfirm={confirmModalState.onConfirm}
        onCancel={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl border border-emerald-500/20 bg-brand-card shadow-2xl flex items-center gap-3 animate-slide-up text-left max-w-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-brand-text">{toast.type === 'error' ? 'Error' : 'Success'}</h4>
            <p className="text-[11px] text-brand-text-muted mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Projects;
