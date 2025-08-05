'use client';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void; //call back khi đổi trang
  isCompact?: boolean; // chế độ hiển thị compact/full
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, isCompact = false }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // tôi đa có 5 số trang hiển thị
    
    // case 1: nếu ít trang <= 5
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }
    // case 2: nếu nhiều trang 
    else {
      if (currentPage <= 3) { // đang ở đầu 
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) { // đang ở cuối
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else { // ở giữa
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className={`flex items-center ${isCompact ? 'space-x-1' : 'justify-center space-x-2 mt-8'}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'} rounded-md font-medium transition-colors ${
          currentPage === 1
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        ‹
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => (
        <div key={index}>
          {page === '...' ? (
            <span className={`${isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-2'} text-gray-500`}>...</span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              className={`${isCompact ? 'px-2 py-1 text-xs min-w-[24px]' : 'px-3 py-2 text-sm'} rounded-md font-medium transition-colors ${
                currentPage === page
                  ? 'bg-[#8ba63a] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          )}
        </div>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'} rounded-md font-medium transition-colors ${
          currentPage === totalPages
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;
