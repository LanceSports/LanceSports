import React from 'react';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { HeaderBar } from './HeaderBar';
import { LiveOverlay } from './LiveOverlay';
import { Setup } from './Setup';
import { MatchProvider } from '../hooks/useMatchStore';

export function PremierLeague() {
  const [currentPage, setCurrentPage] = useState<'live' | 'setup'>('live');

  return (
    <MatchProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">Premier League</h1>
              <p className="text-green-100 text-lg">Live Match Management & Broadcasting</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex space-x-8">
              <button
                onClick={() => setCurrentPage('live')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  currentPage === 'live'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🎥 Live Overlay
              </button>
              <button
                onClick={() => setCurrentPage('setup')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  currentPage === 'setup'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                ⚙️ Match Setup
              </button>
            </div>
          </div>
        </div>

        <HeaderBar />
        <main className="min-h-[calc(100vh-16rem)]">
          {currentPage === 'setup' ? <Setup /> : <LiveOverlay />}
        </main>
        <footer className="bg-white border-t py-8 mt-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-600">
                  © 2025 LanceSports. Live broadcasting made simple.
                </p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">v1.0.0</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span>Press G for Goal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  <span>Press Y for Yellow Card</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                  <span>Press R for Red Card</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">⚽</span>
                  <span>Press P for Pause/Resume</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
        <Toaster />
      </div>
    </MatchProvider>
  );
}