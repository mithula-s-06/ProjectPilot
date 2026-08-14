import React, { createContext, useState, useContext } from 'react';

export const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    const lastPage = localStorage.getItem('lastActivePage');

    if (token && storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (lastPage && ['admin', 'student', 'mentor', 'team-leader'].includes(lastPage)) {
          return lastPage;
        }
        if (u.role === 'System Administrator' || u.role === 'Admin') return 'admin';
        if (u.role === 'Mentor') return 'mentor';
        if (u.role === 'Team Leader') return 'team-leader';
        if (u.role === 'Student') return 'student';
      } catch (e) {
        console.error(e);
      }
    }
    return lastPage && ['signup', 'login'].includes(lastPage) ? lastPage : 'landing';
  });

  const navigateTo = (page) => {
    if (page === 'landing') {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('projects');
      localStorage.removeItem('registeredUsers');
      localStorage.removeItem('notifications');
      localStorage.removeItem('lastActivePage');
    } else {
      localStorage.setItem('lastActivePage', page);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll back to top
  };

  return (
    <PageContext.Provider value={{ currentPage, navigateTo }}>
      {children}
    </PageContext.Provider>
  );
};
