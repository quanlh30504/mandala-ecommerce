import React from 'react';

interface ProgressBarProps {
  label: string;
  percentage: number;
  color: string;
}

export function ProgressBar({ label, percentage, color }: ProgressBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
