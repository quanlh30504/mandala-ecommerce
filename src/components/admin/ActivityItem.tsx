import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ActivityItemProps {
  title: string;
  time: string;
  icon: LucideIcon;
  iconColor: {
    bg: string;
    text: string;
  };
}

export function ActivityItem({ title, time, icon: Icon, iconColor }: ActivityItemProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className={`w-8 h-8 ${iconColor.bg} rounded-full flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${iconColor.text}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}
