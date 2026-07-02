import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import ProjectCard from './ProjectCard';

const ProjectGrid = ({ projects = [], onViewProject, onEditProject, onDeleteProject }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = (projects || []).filter((project) => {
    if (!project) return false;
    const name = project.name || '';
    const mentor = project.mentor || '';
    const domain = project.domain || '';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 w-full text-left">
      
      {/* Toolbar filters */}
      <div className="p-4 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <FiSearch className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50" />
          <input
            type="text"
            placeholder="Search by project name, mentor, domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:border-primary/50 transition-all duration-300 text-sm"
          />
        </div>

      </div>

      {/* Responsive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewDetails={() => onViewProject(project)}
              onEdit={onEditProject ? () => onEditProject(project) : null}
              onDelete={onDeleteProject ? () => onDeleteProject(project.id) : null}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-sm text-brand-text-muted">
            No projects found matching the criteria.
          </div>
        )}
      </div>
      
    </div>
  );
};

export default ProjectGrid;
