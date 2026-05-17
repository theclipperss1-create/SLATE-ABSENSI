'use client';

import React from 'react';

interface LogItem {
  id: number;
  date: string;
  status: string;
  time: string;
  img: string;
}

interface LogTrackerProps {
  history: LogItem[];
}

export function LogTracker({ history }: LogTrackerProps) {
  return (
    <div>
      <div className="bg-white dark:bg-[#1D1D1F] rounded-2xl border border-[#E5E5EA] dark:border-[#3A3A3C] overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#E5E5EA] dark:border-[#3A3A3C] bg-[#F5F5F7]/50 dark:bg-[#3A3A3C]/50">
              <th className="p-4 font-medium text-[#86868B] text-xs uppercase">Tanggal</th>
              <th className="p-4 font-medium text-[#86868B] text-xs uppercase">Status</th>
              <th className="p-4 font-medium text-[#86868B] text-xs uppercase">Bukti</th>
            </tr>
          </thead>
          <tbody>
            {history.map((log) => (
              <tr key={log.id} className="border-b border-[#E5E5EA] dark:border-[#3A3A3C] last:border-b-0">
                <td className="p-4">
                  <p className="font-bold text-black dark:text-white">{log.date}</p>
                  <p className="text-xs text-[#86868B] mt-0.5">{log.time}</p>
                </td>
                <td className="p-4 font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{log.status}</td>
                <td className="p-4">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F5F5F7] dark:bg-[#3A3A3C] border border-[#E5E5EA] dark:border-[#3A3A3C]">
                    <img src={log.img} alt="Selfie" className="w-full h-full object-cover" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
