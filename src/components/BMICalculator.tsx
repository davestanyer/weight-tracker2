import React from 'react';

interface BMICalculatorProps {
  weight: number | null; // in kg
  height: number | null; // in cm
}

export function BMICalculator({ weight, height }: BMICalculatorProps) {
  const calculateBMI = (weight: number | null, height: number | null): number => {
    if (!weight || !height || height === 0) return 0;
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

  const bmi = calculateBMI(weight, height);
  const { category, color } = getBMICategory(bmi);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">BMI Calculator</h2>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold">{bmi || '—'}</p>
          <p className={`${color} font-medium`}>{category}</p>
        </div>
        <div className="text-sm text-gray-600">
          <p>Height: {height || '—'} cm</p>
          <p>Weight: {weight || '—'} kg</p>
        </div>
      </div>
    </div>
  );
}