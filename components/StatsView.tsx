import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { SwipeStats } from '../types';

interface StatsViewProps {
  stats: SwipeStats;
}

export const StatsView: React.FC<StatsViewProps> = ({ stats }) => {
  const data = [
    { name: 'Kept', value: stats.kept },
    { name: 'Removed', value: stats.removed },
  ];
  
  // If no actions taken yet, show a placeholder
  const isEmpty = stats.kept === 0 && stats.removed === 0;
  const displayData = isEmpty ? [{ name: 'Pending', value: 1 }] : data;

  const COLORS = ['#10B981', '#EF4444'];
  const EMPTY_COLOR = '#333';

  return (
    <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-700">
      <h3 className="text-lg font-bold text-gray-200 mb-4 text-center">Cleanup Progress</h3>
      
      <div className="h-48 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={isEmpty ? EMPTY_COLOR : COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="block text-2xl font-bold text-white">{stats.kept + stats.removed}</span>
            <span className="text-xs text-gray-400 uppercase">Reviewed</span>
        </div>
      </div>

      <div className="flex justify-between mt-6 px-4">
        <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Unsubbed</p>
            <p className="text-xl font-bold text-red-500">{stats.removed}</p>
        </div>
        <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Kept</p>
            <p className="text-xl font-bold text-green-500">{stats.kept}</p>
        </div>
      </div>
    </div>
  );
};