import React from 'react';

export default function Spinner({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-solid border-current border-t-transparent ${selectedSize} ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
