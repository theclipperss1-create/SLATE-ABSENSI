'use client';

import React from 'react';

interface ScheduleItem {
  id: number;
  time: string;
  subject: string;
  active: boolean;
}

interface TimetableProps {
  schedule: ScheduleItem[];
}

export function Timetable({ schedule }: TimetableProps) {
  return (
    <div>
      <div className="bg-white dark:bg-[#1D1D1F] rounded-2xl border border-[#E5E5EA] dark:border-[#3A3A3C] overflow-hidden shadow-sm">
        {schedule.map((item) => (
          <div 
            key={item.id} 
            className={`flex items-center p-5 border-b border-[#E5E5EA] dark:border-[#3A3A3C] last:border-b-0 relative ${
              item.active ? 'bg-[#F5F5F7]/50 dark:bg-[#3A3A3C]/50' : ''
            }`}
          >
            {item.active && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-black dark:bg-white" />
            )}
            <div className="w-16 font-bold text-black dark:text-white text-sm">{item.time}</div>
            <div className="text-[#1D1D1F] dark:text-[#F5F5F7] text-sm font-medium">{item.subject}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
