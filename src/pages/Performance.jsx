import React, { useState } from 'react';
import { FiGithub, FiCheckSquare, FiFileText, FiActivity } from 'react-icons/fi';
import PerformanceTable from '../components/PerformanceTable';

const Performance = ({ project, teamName }) => {
  const [members] = useState(() => {
    if (teamName === 'Team Beta') {
      return [
        { name: 'Rohan Patel', role: 'Team Leader', commits: 96, prs: 10, completedTasks: 6, pendingTasks: 1, reportRate: 100, score: 88 },
        { name: 'Priya Singh', role: 'Developer', commits: 80, prs: 8, completedTasks: 5, pendingTasks: 2, reportRate: 90, score: 84 },
        { name: 'Kabir Sen', role: 'Developer', commits: 45, prs: 3, completedTasks: 4, pendingTasks: 3, reportRate: 80, score: 78 }
      ];
    }
    if (teamName === 'Team Gamma') {
      return [
        { name: 'Sameer Verma', role: 'Team Leader', commits: 64, prs: 6, completedTasks: 5, pendingTasks: 3, reportRate: 75, score: 76 },
        { name: 'Aditi Rao', role: 'Developer', commits: 55, prs: 5, completedTasks: 4, pendingTasks: 2, reportRate: 80, score: 74 },
        { name: 'Rajesh K', role: 'Developer', commits: 38, prs: 4, completedTasks: 3, pendingTasks: 4, reportRate: 60, score: 68 }
      ];
    }
    if (teamName === 'Team Delta') {
      return [
        { name: 'Neha Gupta', role: 'Team Leader', commits: 28, prs: 2, completedTasks: 3, pendingTasks: 4, reportRate: 50, score: 62 },
        { name: 'Karan Johar', role: 'Developer', commits: 20, prs: 1, completedTasks: 2, pendingTasks: 5, reportRate: 40, score: 55 },
        { name: 'Sanjay Dutt', role: 'Developer', commits: 15, prs: 0, completedTasks: 1, pendingTasks: 6, reportRate: 30, score: 48 }
      ];
    }
    if (teamName === 'Team Alpha') {
      return [
        { name: 'Ankit Sharma', role: 'Team Leader', commits: 142, prs: 18, completedTasks: 8, pendingTasks: 2, reportRate: 100, score: 94 },
        { name: 'Sneha Reddy', role: 'Developer', commits: 96, prs: 10, completedTasks: 6, pendingTasks: 1, reportRate: 100, score: 88 },
        { name: 'Amit Mehta', role: 'Developer', commits: 64, prs: 6, completedTasks: 5, pendingTasks: 3, reportRate: 75, score: 76 },
        { name: 'Vikram Rao', role: 'Developer', commits: 28, prs: 2, completedTasks: 3, pendingTasks: 4, reportRate: 50, score: 62 }
      ];
    }
    
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      if (teamName && teamName !== 'Not Assigned') {
        const teamUsers = registeredUsers.filter(u => u.team === teamName);
        return teamUsers.map((u, idx) => ({
          name: u.fullName || u.name,
          role: u.role,
          commits: idx === 0 ? 35 : Math.floor(Math.random() * 20) + 10,
          prs: idx === 0 ? 4 : Math.floor(Math.random() * 3),
          completedTasks: idx === 0 ? 3 : Math.floor(Math.random() * 2) + 1,
          pendingTasks: idx === 0 ? 1 : Math.floor(Math.random() * 3) + 1,
          reportRate: idx === 0 ? 100 : 75,
          score: idx === 0 ? 80 : 70
        }));
      }
    } catch (e) {
      console.error(e);
    }
    
    return [];
  });

  return (
    <div className="space-y-6 w-full text-left animate-fade-in">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
          Performance Audits
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-muted">
          Analyze code repository commits, task velocity metrics, and report submission frequencies.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Commit Share */}
        <div className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest block">Avg Git Workshare</span>
            <span className="text-xl font-extrabold text-brand-text mt-1 block">68%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FiGithub className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Task Rate */}
        <div className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest block">Task Completion Rate</span>
            <span className="text-xl font-extrabold text-cyan-500 mt-1 block">75%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
            <FiCheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Report Rate */}
        <div className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest block">Report Compliance</span>
            <span className="text-xl font-extrabold text-primary mt-1 block">90%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <FiFileText className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Health Index */}
        <div className="p-5 rounded-2xl border border-brand-border bg-brand-card/45 backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest block">Overall Health</span>
            <span className="text-xl font-extrabold text-emerald-500 mt-1 block">88%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <FiActivity className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Ledger Table */}
      <PerformanceTable members={members} />

    </div>
  );
};

export default Performance;
