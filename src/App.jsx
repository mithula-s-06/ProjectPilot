import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { PageProvider } from './context/PageContext';
import { usePage } from './hooks/usePage';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import Signup from './pages/Signup';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import TeamLeaderDashboard from './pages/TeamLeaderDashboard';

function AppContent() {
  const { currentPage } = usePage();

  if (currentPage === 'signup') {
    return <Signup />;
  }

  if (currentPage === 'login') {
    return <Login />;
  }

  if (currentPage === 'admin') {
    return <AdminDashboard />;
  }

  if (currentPage === 'student') {
    return <StudentDashboard />;
  }

  if (currentPage === 'mentor') {
    return <MentorDashboard />;
  }

  if (currentPage === 'team-leader') {
    return <TeamLeaderDashboard />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-bg text-brand-text transition-colors duration-300">
      <Navbar />
      <Home />
      <Footer />
    </div>
  );
}

import { useEffect } from 'react';
import { initialUsers, studentProjects } from './utils/mockData';

function App() {
  useEffect(() => {
    const storedUsers = localStorage.getItem('registeredUsers');
    if (!storedUsers) {
      const users = initialUsers.map(user => ({
        id: user.id,
        fullName: user.name,
        email: user.email,
        password: 'PASSWORD', // Default password for initial mock users
        role: user.role === 'Student / Team Leader' ? 'Team Leader' : user.role === 'Mentor' ? 'Mentor' : 'Student',
        collegeName: 'ProjectPilot University',
        department: 'Computer Science & Engineering',
        status: user.status,
        avatarInitials: user.avatarInitials,
        avatarBg: user.avatarBg,
        team: user.team
      }));
      localStorage.setItem('registeredUsers', JSON.stringify(users));
    }

    const storedProjects = localStorage.getItem('projects');
    if (!storedProjects) {
      const projectsWithTeams = studentProjects.map(p => {
        let team = 'Not Assigned';
        if (p.name.includes('Attendance')) team = 'Team Alpha';
        else if (p.name.includes('Health')) team = 'Team Beta';
        else if (p.name.includes('Plagiarism')) team = 'Team Gamma';
        else if (p.name.includes('Irrigation')) team = 'Team Delta';
        else if (p.name.includes('Voting') || p.name.includes('Blockchain')) team = 'Team Omega';
        return { ...p, teamName: team };
      });
      localStorage.setItem('projects', JSON.stringify(projectsWithTeams));
    }
  }, []);

  return (
    <ThemeProvider>
      <PageProvider>
        <AppContent />
      </PageProvider>
    </ThemeProvider>
  );
}

export default App;
