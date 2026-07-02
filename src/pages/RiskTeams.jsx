import React, { useState, useEffect } from 'react';
import RiskTeamCard from '../components/RiskTeamCard';

const RiskTeams = ({ onViewRiskDetails }) => {
  const [riskTeams, setRiskTeams] = useState(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const loggedInMentorName = currentUser.fullName || currentUser.name || 'Dr. Kumar';
      
      const storedProj = localStorage.getItem('projects');
      const storedUsers = localStorage.getItem('registeredUsers');
      
      const registeredUsers = storedUsers ? JSON.parse(storedUsers) : [];
      const projects = storedProj ? JSON.parse(storedProj) : [];

      const mentorProjects = projects.filter(p => p.mentor && p.mentor.toLowerCase() === loggedInMentorName.toLowerCase());

      return mentorProjects.map((p, idx) => {
        const members = registeredUsers.filter(u => u.team && u.team.toLowerCase() === p.teamName?.toLowerCase());
        const leader = registeredUsers.find(u => u.team && u.team.toLowerCase() === p.teamName?.toLowerCase() && u.role === 'Team Leader');
        
        const health = p.health && p.health < 60 ? p.health : 52;
        
        return {
          id: p.id || `risk-team-${idx}`,
          name: p.teamName || `${loggedInMentorName} Team`,
          project: p.name,
          health: health,
          riskLevel: health < 50 ? 'Critical Risk' : 'High Risk',
          reasons: ['Low GitHub Activity', 'Delayed Milestones', 'Pending Reports'],
          leaderName: leader ? (leader.fullName || leader.name) : 'Not Assigned',
          members: members.filter(m => m.role !== 'Team Leader').map(m => m.fullName || m.name),
          domain: p.domain || 'General'
        };
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  useEffect(() => {
    const handleFocus = () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const loggedInMentorName = currentUser.fullName || currentUser.name || 'Dr. Kumar';
        
        const storedProj = localStorage.getItem('projects');
        const storedUsers = localStorage.getItem('registeredUsers');
        if (storedProj) {
          const registeredUsers = storedUsers ? JSON.parse(storedUsers) : [];
          const projects = JSON.parse(storedProj);

          const mentorProjects = projects.filter(p => p.mentor && p.mentor.toLowerCase() === loggedInMentorName.toLowerCase());

          const nextRiskTeams = mentorProjects.map((p, idx) => {
            const members = registeredUsers.filter(u => u.team && u.team.toLowerCase() === p.teamName?.toLowerCase());
            const leader = registeredUsers.find(u => u.team && u.team.toLowerCase() === p.teamName?.toLowerCase() && u.role === 'Team Leader');
            
            const health = p.health && p.health < 60 ? p.health : 52;
            
            return {
              id: p.id || `risk-team-${idx}`,
              name: p.teamName || `${loggedInMentorName} Team`,
              project: p.name,
              health: health,
              riskLevel: health < 50 ? 'Critical Risk' : 'High Risk',
              reasons: ['Low GitHub Activity', 'Delayed Milestones', 'Pending Reports'],
              leaderName: leader ? (leader.fullName || leader.name) : 'Not Assigned',
              members: members.filter(m => m.role !== 'Team Leader').map(m => m.fullName || m.name),
              domain: p.domain || 'General'
            };
          });

          setRiskTeams(nextRiskTeams);
        }
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return (
    <div className="space-y-6 w-full text-left">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
          Risk Intervention Center
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-muted">
          Identify delayed sprints, lagging commit histories, or low participation scores flagged by AI diagnostics.
        </p>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {riskTeams.length > 0 ? (
          riskTeams.map((team) => (
            <RiskTeamCard
              key={team.id}
              team={team}
              onViewDetails={() => onViewRiskDetails(team)}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-sm text-brand-text-muted italic bg-brand-card/25 border border-brand-border rounded-2xl">
            No high risk warning teams flagged. Excellent progress across the board!
          </div>
        )}
      </div>

    </div>
  );
};

export default RiskTeams;
