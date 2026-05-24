import React from 'react';
import { Calendar, LayoutGrid, RefreshCw, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface HeaderProps {
  currentView: 'grid' | 'calendar';
  setView: (view: 'grid' | 'calendar') => void;
  lastRefreshed: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function Header({
  currentView,
  setView,
  lastRefreshed,
  onRefresh,
  isRefreshing,
}: HeaderProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <header className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-8 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-border mb-8">
      {/* Title & Logo */}
      <div className="flex items-center gap-4">
        {/* Cute Cat Mascot Logo */}
        <div className="relative w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-md animate-purr border-4 border-surface">
          {/* Cat Ears */}
          <div className="absolute -top-1.5 -left-1 w-5 h-5 bg-primary rounded-tl-xl rounded-br-xs transform -rotate-12 border-t-2 border-l-2 border-surface" />
          <div className="absolute -top-1.5 -right-1 w-5 h-5 bg-primary rounded-tr-xl rounded-bl-xs transform rotate-12 border-t-2 border-r-2 border-surface" />
          
          {/* Inner Ears */}
          <div className="absolute -top-0.5 -left-0.2 w-2.5 h-3 bg-accent rounded-tl-lg" />
          <div className="absolute -top-0.5 -right-0.2 w-2.5 h-3 bg-accent rounded-tr-lg" />
          
          {/* Cat Face (Moustaches & Eyes) */}
          <svg viewBox="0 0 100 100" className="w-8 h-8 text-surface fill-current">
            {/* Eyes */}
            <circle cx="35" cy="45" r="5" />
            <circle cx="65" cy="45" r="5" />
            {/* Nose */}
            <polygon points="50,55 45,50 55,50" />
            {/* Smile */}
            <path d="M45,57 C47,59 50,59 50,57 C50,59 53,59 55,57" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            Senpai Meow <span className="text-primary text-2xl md:text-3xl">🐾</span>
          </h1>
          <p className="text-sm font-medium text-muted mt-0.5 max-w-md">
            Track upcoming anime episodes by day, season, and release time.
          </p>
        </div>
      </div>

      {/* Control Buttons & Info */}
      <div className="flex flex-wrap items-center gap-3 md:self-end">
        {/* Last Refreshed Info */}
        <div className="flex items-center gap-2 text-xs font-semibold text-muted bg-surface px-3 py-2 rounded-full border border-border shadow-xs">
          <span>
            {lastRefreshed === 'Never' ? 'Loading schedule...' : `Last updated: ${lastRefreshed}`}
          </span>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-1 hover:bg-accent rounded-full text-primary transition-colors disabled:opacity-50 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh schedule"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex bg-accent/60 p-1.5 rounded-2xl border border-border">
          <button
            onClick={() => setView('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold card-transition ${
              currentView === 'grid'
                ? 'bg-primary text-surface shadow-xs'
                : 'text-primary hover:bg-accent'
            }`}
          >
            <LayoutGrid size={16} />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold card-transition ${
              currentView === 'calendar'
                ? 'bg-primary text-surface shadow-xs'
                : 'text-primary hover:bg-accent'
            }`}
          >
            <Calendar size={16} />
            <span>Calendar</span>
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center p-3 rounded-2xl bg-surface border border-border text-primary hover:bg-accent hover:text-primary-hover transition-all shadow-xs cursor-pointer active:scale-95"
          title={mounted && theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {!mounted ? (
            <div className="w-4 h-4" />
          ) : theme === 'light' ? (
            <Moon size={16} />
          ) : (
            <Sun size={16} />
          )}
        </button>
      </div>
    </header>
  );
}
