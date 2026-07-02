import React from 'react';
import TeamCard from '../components/TeamCard';

const ActiveTeams = ({ teams = [], onViewTeam }) => {
  const mentorTeams = (() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const loggedInMentorName = currentUser.fullName || currentUser.name || 'Dr. Kumar';
      return teams.filter(t => t.mentor && t.mentor.toLowerCase() === loggedInMentorName.toLowerCase());
    } catch (e) {
      console.error(e);
      return teams;
    }
  })();

  return (
    <div className="space-y-6 w-full text-left">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-1 tracking-tight">
          Active Assigned Teams
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-muted">
          Manage and track the execution progress of student teams under your direct academic mentorship.
        </p>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentorTeams.length > 0 ? (
          mentorTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onViewTeam={() => onViewTeam(team)}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-sm text-brand-text-muted italic bg-brand-card/25 border border-brand-border rounded-2xl">
            No active teams currently assigned to your profile.
          </div>
        )}
      </div>

    </div>
  );
};

export default ActiveTeams;
