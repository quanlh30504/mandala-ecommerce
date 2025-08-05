'use client';
import React from 'react';

interface TagListProps {
  tags: string[];
  selectedTags: string[];
  onSelectTag: (tag: string) => void;
  onClearAllTags: () => void;
}

const TagList: React.FC<TagListProps> = ({ tags, selectedTags, onSelectTag, onClearAllTags }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
          TAG SẢN PHẨM
        </h3>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearAllTags}
            className="text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            Xóa tất cả
          </button>
        )}
      </div>
      
      {selectedTags.length > 0 && (
        <div className="mb-3 p-2 bg-green-50 rounded-md">
          <div className="text-xs text-gray-600 mb-1">Đã chọn ({selectedTags.length}):</div>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <span
                key={`selected-${tag}`}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#8ba63a] text-white"
              >
                {tag}
                <button
                  onClick={() => onSelectTag(tag)}
                  className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center"
                  title="Bỏ chọn"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => onSelectTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-[#8ba63a] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TagList;
