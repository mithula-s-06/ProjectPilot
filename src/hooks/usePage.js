import { useContext } from 'react';
import { PageContext } from '../context/PageContext';

export const usePage = () => {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
};
