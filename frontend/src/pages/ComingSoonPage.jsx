import React from 'react';
import { Clock } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

export default function ComingSoonPage({ title = 'Coming Next' }) {
  return (
    <div className="py-8">
      <EmptyState
        icon={Clock}
        title={`${title} — Coming Next`}
        description="This section is part of the next stage. For now, explore the Dashboard, log daily expenses, and check your monthly budget status."
      />
    </div>
  );
}
