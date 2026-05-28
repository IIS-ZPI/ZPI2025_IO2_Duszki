import React from 'react';

interface StatBoxProps {
  title: string;
  value: string | number;
  valueColor?: string;
  icon?: React.ReactNode;
}

export const StatBox = ({ title, value, valueColor = "text-gray-900", icon }: StatBoxProps) => (
  <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center relative">
    {icon && <div className="absolute top-3 right-3 text-gray-300">{icon}</div>}
    <span className="text-[10px] uppercase text-gray-500 mb-1 tracking-wider text-center z-10">{title}</span>
    <span className={`text-xl md:text-2xl font-bold ${valueColor} z-10`}>{value}</span>
  </div>
);