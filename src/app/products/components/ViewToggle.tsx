'use client';
import React from 'react';
import { FaThLarge, FaList } from 'react-icons/fa';

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewChange }) => {
  return (
    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 rounded-md transition-colors ${
          viewMode === 'grid'
            ? 'bg-white text-[#8ba63a] shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        title="Grid View"
      >
        <FaThLarge className="text-sm" />
      </button>
      
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 rounded-md transition-colors ${
          viewMode === 'list'
            ? 'bg-white text-[#8ba63a] shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        title="List View"
      >
        <FaList className="text-sm" />
      </button>
    </div>
  );
};

export default ViewToggle;
