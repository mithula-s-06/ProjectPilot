import React, { createContext, useState, useContext } from 'react';

export const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'signup', 'login'

  const navigateTo = (page) => {
    if (page === 'landing') {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('projects');
      localStorage.removeItem('registeredUsers');
      localStorage.removeItem('notifications');
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
