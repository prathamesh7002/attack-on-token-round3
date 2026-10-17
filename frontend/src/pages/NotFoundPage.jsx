import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-accent text-2xl font-bold mb-4 shadow-sm">
        404
      </div>
      <h1 className="text-2xl font-semibold text-text-primary mb-2">Page Not Found</h1>
      <p className="text-base text-text-muted max-w-sm mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
}
