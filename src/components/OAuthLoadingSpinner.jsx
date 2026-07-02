import React from 'react';

const OAuthLoadingSpinner = ({ className = "w-4 h-4" }) => {
  return (
    <div 
      className={`animate-spin rounded-full border-2 border-brand-text-muted/20 border-t-primary ${className}`} 
      style={{ borderTopColor: 'var(--color-primary)' }}
    />
  );
};

export default OAuthLoadingSpinner;
