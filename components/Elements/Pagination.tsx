import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) => {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }

    return pageNumbers;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumber = (pageNumber: number) => {
    const isActive = pageNumber === currentPage;

    return (
      <button
        key={pageNumber}
        onClick={() => handlePageChange(pageNumber)}
        className={`
          h-8 w-8 flex items-center justify-center rounded-full transition-all duration-200 ease-in-out
          ${isActive ? 'bg-primary text-white' : 'text-white hover:bg-primary'}
        `}
        aria-current={isActive ? 'page' : undefined}
      >
        {pageNumber}
      </button>
    );
  };

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <button
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        className="h-8 w-8 flex items-center justify-center rounded-full text-white hover:bg-primary disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
        aria-label="Go to first page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </button>

      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 flex items-center justify-center rounded-full text-white hover:bg-primary disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center">
        {getPageNumbers().map(renderPageNumber)}
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 flex items-center justify-center rounded-full text-white hover:bg-primary disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <button
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 flex items-center justify-center rounded-full text-white hover:bg-primary disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
        aria-label="Go to last page"
      >
        <ChevronsRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination;
