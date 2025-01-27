import React from 'react';
import { Menu, User, LogOut, Settings, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  userName?: string;
  onSettingsClick: () => void;
}

export function Header({ userName, onSettingsClick }: HeaderProps) {
  const { signOut } = useAuth();

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-4 px-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-indigo-500 rounded-full lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-indigo-200" />
            <h1 className="text-xl font-bold">Shape Shifter</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <User className="w-5 h-5 text-indigo-200" />
            <span className="text-sm">{userName || 'Guest'}</span>
          </div>
          
          <button
            onClick={onSettingsClick}
            className="p-2 hover:bg-indigo-500 rounded-full md:px-3 md:py-1 md:rounded-md flex items-center space-x-1"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
            <span className="hidden md:inline">Settings</span>
          </button>
          
          <button 
            onClick={signOut}
            className="p-2 hover:bg-indigo-500 rounded-full md:px-3 md:py-1 md:rounded-md flex items-center space-x-1"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}