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
import { api } from './utils/api';

function App() {
  useEffect(() => {
    async function initSession() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Check token session
          await api.getSession();
          
          // Background sync
          const projects = await api.listProjects();
          localStorage.setItem('projects', JSON.stringify(projects || []));

          const users = await api.listUsers();
          const mappedUsers = (users || []).map(u => ({
            id: u.id,
            fullName: u.name,
            email: u.email,
            role: u.role === 'TEAM_LEADER' ? 'Team Leader' : u.role === 'MENTOR' ? 'Mentor' : 'Student',
            collegeName: 'ProjectPilot University',
            department: u.department || 'Computer Science & Engineering',
            status: 'Active',
            team: u.team || 'Not Assigned'
          }));
          localStorage.setItem('registeredUsers', JSON.stringify(mappedUsers));

          // Sync the active currentUser's details using the registeredUsers database match
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            const currentUser = JSON.parse(storedUser);
            const myUserRecord = mappedUsers.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase());
            if (myUserRecord) {
              if (myUserRecord.fullName) currentUser.fullName = myUserRecord.fullName;
              currentUser.team = myUserRecord.team || 'Not Assigned';
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
          }
        } catch (err) {
          console.warn('Session verification or background sync failed:', err);
          // Token is invalid/expired
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
        }
      }

      // Fallback local seeding if nothing in storage
      const storedUsers = localStorage.getItem('registeredUsers');
      if (!storedUsers) {
        localStorage.setItem('registeredUsers', JSON.stringify([]));
      }

      const storedProjects = localStorage.getItem('projects');
      if (!storedProjects) {
        localStorage.setItem('projects', JSON.stringify([]));
      }
    }

    initSession();
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
