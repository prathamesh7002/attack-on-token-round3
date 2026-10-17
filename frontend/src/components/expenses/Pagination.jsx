import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../common/Button';

export default function Pagination({
  total = 0,
  limit = 10,
  offset = 0,
  onPageChange,
}) {
  if (total <= limit) return null;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const startItem = offset + 1;
  const endItem = Math.min(total, offset + limit);

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(offset - limit);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(offset + limit);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      <span className="text-xs text-text-muted">
        Showing <strong className="text-text-primary">{startItem}</strong> to{' '}
        <strong className="text-text-primary">{endItem}</strong> of{' '}
        <strong className="text-text-primary">{total}</strong> expenses
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="h-9 px-3 text-xs"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Previous</span>
        </Button>

        <span className="text-xs font-semibold px-2 py-1 bg-surface border border-surface-border rounded text-text-primary select-none">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="h-9 px-3 text-xs"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
