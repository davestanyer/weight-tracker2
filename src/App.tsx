import React, { useState, useEffect } from 'react';
import { RequireAuth } from './components/auth/RequireAuth';
import { Header } from './components/Header';
import { WeightChart } from './components/WeightChart';
import { QuickActions } from './components/QuickActions';
import { LogModal } from './components/LogModal';
import { MealTracker } from './components/MealTracker';
import { UserSettings } from './components/UserSettings';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import type { WeightLog, Profile, Meal } from './types';
import { Settings as SettingsIcon, Scale, Apple } from 'lucide-react';

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

export default function App() {
  const { user } = useAuth();
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WeightLog | null>(null);
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [refreshMealKey, setRefreshMealKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'weight' | 'nutrition'>('weight');

  useEffect(() => {
    if (user) {
      loadWeightLogs();
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    setProfile(data);
  };

  const loadWeightLogs = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error loading weight logs:', error);
      return;
    }

    setWeightLogs(data || []);
  };

  const handleLogWeight = async (data: any) => {
    if (!user) return;

    // Parse and validate weight
    const weight = parseFloat(data.weight);
    if (isNaN(weight) || weight <= 0) {
      alert('Please enter a valid weight');
      return;
    }

    const weightData = {
      user_id: user.id,
      weight,
      date: data.date,
      note: data.note || '',
      created_at: new Date().toISOString()
    };

    try {
      if (editingLog) {
        const { error } = await supabase
          .from('weight_logs')
          .update(weightData)
          .eq('id', editingLog.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('weight_logs')
          .insert([weightData]);

        if (error) throw error;
      }

      setIsWeightModalOpen(false);
      setEditingLog(null);
      await loadWeightLogs();
    } catch (error) {
      console.error('Error saving weight log:', error);
      alert('Failed to save weight log. Please try again.');
    }
  };

  const handleLogMeal = async (data: any) => {
    if (!user) return;

    const mealData = {
      user_id: user.id,
      meal_type: data.mealType,
      description: data.description,
      calories: data.calories ? parseInt(data.calories) : 0,
      date: data.date,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('meals')
      .insert([mealData]);

    if (error) {
      console.error('Error inserting meal log:', error);
      return;
    }

    setIsMealModalOpen(false);
    setSelectedDate(data.date);
    setRefreshMealKey(prev => prev + 1);
  };

  const handleEditLog = (log: WeightLog) => {
    setEditingLog(log);
    setIsWeightModalOpen(true);
  };

  const handleDeleteLog = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('weight_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting weight log:', error);
      return;
    }

    loadWeightLogs();
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <Header 
          userName={user?.email} 
          onSettingsClick={() => setIsSettingsOpen(!isSettingsOpen)}
        />
        
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {isSettingsOpen ? (
            <div className="space-y-4">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
              >
                <SettingsIcon className="w-4 h-4 mr-1" />
                Back to Dashboard
              </button>
              <UserSettings onProfileUpdate={loadProfile} />
            </div>
          ) : (
            <div className="space-y-6">
              <QuickActions
                onLogWeight={() => setIsWeightModalOpen(true)}
                onLogMeal={() => setIsMealModalOpen(true)}
              />

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('weight')}
                  className={`flex items-center px-6 py-3 border-b-2 text-sm font-medium ${
                    activeTab === 'weight'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Scale className="w-5 h-5 mr-2" />
                  Weight Tracking
                </button>
                <button
                  onClick={() => setActiveTab('nutrition')}
                  className={`flex items-center px-6 py-3 border-b-2 text-sm font-medium ${
                    activeTab === 'nutrition'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Apple className="w-5 h-5 mr-2" />
                  Nutrition Tracking
                </button>
              </div>

              {/* Content */}
              <div className="min-h-[600px]">
                {activeTab === 'weight' ? (
                  <WeightChart 
                    weightLogs={weightLogs}
                    targetWeight={profile?.target_weight || null}
                    currentHeight={profile?.height || null}
                    onEditLog={handleEditLog}
                    onDeleteLog={handleDeleteLog}
                  />
                ) : (
                  <MealTracker 
                    key={refreshMealKey}
                    onMealAdded={() => {
                      setIsMealModalOpen(false);
                    }}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                  />
                )}
              </div>

              {/* Weight Log Modal */}
              <LogModal
                isOpen={isWeightModalOpen}
                onClose={() => {
                  setIsWeightModalOpen(false);
                  setEditingLog(null);
                }}
                onSubmit={handleLogWeight}
                title={editingLog ? "Edit Weight Log" : "Log Weight"}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      step="0.1"
                      min="0"
                      defaultValue={editingLog?.weight || ""}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      name="date"
                      defaultValue={editingLog?.date || getCurrentDate()}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Note (optional)</label>
                    <textarea
                      name="note"
                      defaultValue={editingLog?.note}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows={3}
                    />
                  </div>
                </div>
              </LogModal>

              {/* Meal Log Modal */}
              <LogModal
                isOpen={isMealModalOpen}
                onClose={() => setIsMealModalOpen(false)}
                onSubmit={handleLogMeal}
                title="Log Meal"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      name="date"
                      defaultValue={getCurrentDate()}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Meal Type</label>
                    <select
                      name="mealType"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Calories</label>
                    <input
                      type="number"
                      name="calories"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </LogModal>
            </div>
          )}
        </main>
      </div>
    </RequireAuth>
  );
}