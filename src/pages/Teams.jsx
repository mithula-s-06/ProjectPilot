import React, { useState, useEffect } from 'react';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import TeamsTable from '../components/TeamsTable';

const Teams = ({ 
  teams = [], 
  onOpenAssignModal,
  onViewTeam,
  onDeleteTeam
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter logic based on search only (Mentor dropdown removed)
  const filteredTeams = teams.filter((team) => {
    return (
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leaderName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const paginatedTeams = filteredTeams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 w-full text-left">
      
      {/* Page Title & Subtext */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
          Teams Administration
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-muted">
          Manage active student teams, view project details, and allocate academic mentors.
        </p>
      </div>

      {/* Filter Toolbar Card (Filter by Mentor removed) */}
      <div className="p-4 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <FiSearch className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50" />
          <input
            type="text"
            placeholder="Search by team, project, or leader..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:border-primary/50 transition-all duration-300 text-sm"
          />
        </div>

      </div>

      {/* Main Teams Table Display */}
      <div className="p-4 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md space-y-4">
        {paginatedTeams.length > 0 ? (
          <>
            <TeamsTable 
              teams={paginatedTeams} 
              onOpenAssignModal={onOpenAssignModal} 
              onViewTeam={onViewTeam}
              onDeleteTeam={onDeleteTeam}
            />
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-brand-border/40 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 rounded-xl border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all duration-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <span className="text-xs font-extrabold tracking-wider uppercase text-brand-text-muted">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 rounded-xl border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all duration-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center text-sm text-brand-text-muted">
            No teams found matching the search query.
          </div>
        )}
      </div>

    </div>
  );
};

export default Teams;
