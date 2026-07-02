import React, { useState } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';

const AssignMentorModal = ({ isOpen = true, onClose, mentors, onAssign, currentMentorName }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredMentors = mentors.filter((mentor) => {
    // Exclude previously assigned mentor when changing mentor
    if (currentMentorName && mentor.name === currentMentorName) {
      return false;
    }
    return (
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 relative overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <h3 className="text-lg font-bold text-slate-900">Assign Mentor</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors duration-300"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <FiSearch className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by mentor name or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/50 transition-all duration-300 text-sm"
          />
        </div>

        {/* Mentor Cards List */}
        <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
          {filteredMentors.length > 0 ? (
            filteredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between hover:border-primary/20 transition-colors duration-300"
              >
                {/* Left: Avatar + Details */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${mentor.avatarColor}`}>
                    {mentor.avatarInitials}
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-slate-800">{mentor.name}</h4>
                    <p className="text-[11px] text-slate-500">{mentor.department}</p>
                    <span className="text-[10px] text-primary font-semibold mt-1 block">
                      {mentor.currentTeamsAssigned} {mentor.currentTeamsAssigned === 1 ? 'Team' : 'Teams'} Assigned
                    </span>
                  </div>
                </div>

                {/* Right: Assign Button */}
                <button
                  type="button"
                  onClick={() => onAssign(mentor.name)}
                  className="rounded-lg px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs hover:brightness-110 shadow hover:shadow-glow-primary transition-all duration-300 cursor-pointer"
                >
                  Assign
                </button>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-slate-400">
              No mentors found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignMentorModal;
