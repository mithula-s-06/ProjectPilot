import React, { useState } from 'react';
import { FiSearch, FiUserCheck, FiUsers, FiAward } from 'react-icons/fi';
import UsersTable from '../components/UsersTable';

const Users = ({ users = [], onViewUser, onDeleteUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleTab, setRoleTab] = useState('All'); // 'All', 'Student', 'Leader', 'Mentor'

  // Filter users based on search query and role category
  const filteredUsers = users.filter((user) => {
    // 1. Search Query Check
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.team.toLowerCase().includes(searchQuery.toLowerCase());
      
    // 2. Role Category Tab Check
    let matchesTab = true;
    if (roleTab === 'Student') {
      matchesTab = user.role === 'Student';
    } else if (roleTab === 'Leader') {
      matchesTab = user.role === 'Team Leader';
    } else if (roleTab === 'Mentor') {
      matchesTab = user.role === 'Mentor';
    }

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 w-full text-left">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
          Users Directory
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-muted">
          View and manage active student, leader, and academic mentor accounts.
        </p>
      </div>

      {/* Toolbar - Search input */}
      <div className="p-4 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <FiSearch className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-brand-text-muted/50" />
          <input
            type="text"
            placeholder="Search by name, email, or team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 dark:bg-slate-900/30 text-brand-text placeholder-brand-text-muted/40 focus:outline-none focus:border-primary/50 transition-all duration-300 text-sm"
          />
        </div>

        {/* Tab Selection buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          {[
            { id: 'All', label: 'All Users', icon: <FiUsers className="w-3.5 h-3.5" /> },
            { id: 'Student', label: 'Students', icon: <FiUserCheck className="w-3.5 h-3.5 text-slate-500" /> },
            { id: 'Leader', label: 'Team Leaders', icon: <FiUsers className="w-3.5 h-3.5 text-primary" /> },
            { id: 'Mentor', label: 'Mentors', icon: <FiAward className="w-3.5 h-3.5 text-secondary" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleTab(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                roleTab === tab.id
                  ? 'bg-gradient-to-r from-primary/20 to-secondary/15 text-primary border border-primary/20'
                  : 'border border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

      </div>

      {/* Main Table Card */}
      <div className="p-4 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-md shadow-md">
        {filteredUsers.length > 0 ? (
          <UsersTable users={filteredUsers} onViewUser={onViewUser} onDeleteUser={onDeleteUser} />
        ) : (
          <div className="py-12 text-center text-sm text-brand-text-muted">
            No users found matching the search criteria.
          </div>
        )}
      </div>

    </div>
  );
};

export default Users;
