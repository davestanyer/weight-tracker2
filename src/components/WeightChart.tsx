import React from 'react';
import { LineChart, TrendingUp, TrendingDown, Edit2, Trash2 } from 'lucide-react';
import type { WeightLog } from '../types';

interface WeightChartProps {
  weightLogs: WeightLog[];
  targetWeight: number | null;
  currentHeight: number | null;
  onEditLog?: (log: WeightLog) => void;
  onDeleteLog?: (id: string) => void;
}

export function WeightChart({ weightLogs, targetWeight, currentHeight, onEditLog, onDeleteLog }: WeightChartProps) {
  // Sort by created_at timestamp
  const sortedLogs = [...weightLogs].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const currentWeight = sortedLogs[0]?.weight || 0;
  const previousWeight = sortedLogs[1]?.weight || currentWeight;
  const weightDiff = (currentWeight - previousWeight).toFixed(1);
  const isGaining = Number(weightDiff) > 0;

  const calculateBMI = (weight: number, height: number | null): number => {
    if (!height || height === 0) return 0;
    const heightInMeters = height / 100;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const getBMICategory = (bmi: number): { category: string; color: string } => {
    if (bmi === 0) return { category: 'Not Available', color: 'text-gray-500' };
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-500' };
    if (bmi < 25) return { category: 'Healthy', color: 'text-green-500' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-500' };
    return { category: 'Obese', color: 'text-red-500' };
  };

  const bmi = calculateBMI(currentWeight, currentHeight);
  const { category, color } = getBMICategory(bmi);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-NZ', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NZ', {
      timeZone: 'Pacific/Auckland',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get last 7 days of weight logs
  const last7DaysLogs = (() => {
    const today = new Date();
    const days: { date: string; weight: number | null }[] = [];
    
    // Create array of last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Find weight log for this date
      const log = sortedLogs.find(l => l.date === dateStr);
      days.push({
        date: dateStr,
        weight: log?.weight || null
      });
    }
    
    return days;
  })();

  // Calculate min and max for chart scaling
  const weights = last7DaysLogs.map(d => d.weight).filter((w): w is number => w !== null);
  const minWeight = Math.min(...weights) - 0.5;
  const maxWeight = Math.max(...weights) + 0.5;
  const weightRange = maxWeight - minWeight;

  // Calculate chart points
  const chartPoints = last7DaysLogs.map((day, index) => {
    if (day.weight === null) return null;
    
    // Calculate position
    const x = (index / 6) * 100; // 6 intervals for 7 points
    const y = ((day.weight - minWeight) / weightRange) * 100;
    
    return { x, y, weight: day.weight, date: day.date };
  });

  // Create SVG path for the line
  const createLinePath = () => {
    const points = chartPoints.filter((p): p is NonNullable<typeof p> => p !== null);
    if (points.length < 2) return '';
    
    return points.map((point, i) => 
      `${i === 0 ? 'M' : 'L'} ${point.x} ${100 - point.y}`
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <LineChart className="w-6 h-6 text-indigo-600 mr-2" />
          Weight & BMI Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weight Stats */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-3xl font-bold">{currentWeight || '—'} kg</p>
                <div className="flex items-center mt-1">
                  {currentWeight > 0 && (
                    <>
                      {isGaining ? (
                        <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                      )}
                      <span className={isGaining ? 'text-red-500' : 'text-green-500'}>
                        {weightDiff} kg
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Target</p>
                <p className="font-semibold">{targetWeight || '—'} kg</p>
              </div>
            </div>

            {/* BMI Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">{bmi || '—'}</p>
                  <p className={`${color} font-medium`}>{category}</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>BMI</p>
                  <p>Height: {currentHeight || '—'} cm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Weight Chart */}
          <div className="relative h-40">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
              <span>{maxWeight.toFixed(1)}</span>
              <span>{((maxWeight + minWeight) / 2).toFixed(1)}</span>
              <span>{minWeight.toFixed(1)}</span>
            </div>

            {/* Chart area */}
            <div className="absolute left-12 right-0 top-0 bottom-0">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="0" x2="100" y2="0" stroke="#e5e7eb" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
                <line x1="0" y1="100" x2="100" y2="100" stroke="#e5e7eb" strokeWidth="0.5" />

                {/* Weight line */}
                <path
                  d={createLinePath()}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                {chartPoints.map((point, i) => point && (
                  <g key={i}>
                    <circle
                      cx={point.x}
                      cy={100 - point.y}
                      r="2"
                      fill="#4f46e5"
                      className="hover:r-3 transition-all duration-200"
                    />
                    {/* Hover tooltip */}
                    <title>{`${formatDate(point.date)}: ${point.weight} kg`}</title>
                  </g>
                ))}
              </svg>

              {/* X-axis labels */}
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                {last7DaysLogs.map((day, i) => (
                  <div key={i}>{formatDate(day.date)}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weight History */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Weight History</h3>
        <div className="overflow-y-auto max-h-[400px]">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    {log.weight} kg
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {log.note || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end space-x-2">
                      {onEditLog && (
                        <button
                          onClick={() => onEditLog(log)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                      {onDeleteLog && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this log?')) {
                              onDeleteLog(log.id);
                            }
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}