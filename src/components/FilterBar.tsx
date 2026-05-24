import React from 'react';
import { Search, X, ChevronDown, Sparkles, SortAsc, Clock } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilter: 'all' | 'today' | 'tomorrow' | 'week';
  setActiveFilter: (filter: 'all' | 'today' | 'tomorrow' | 'week') => void;
  sortBy: 'soon' | 'alpha' | 'popular';
  setSortBy: (sort: 'soon' | 'alpha' | 'popular') => void;
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  availableGenres: string[];
  selectedAudio: string;
  setSelectedAudio: (audio: string) => void;
}

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  sortBy,
  setSortBy,
  selectedPlatform,
  setSelectedPlatform,
  selectedGenre,
  setSelectedGenre,
  availableGenres,
  selectedAudio,
  setSelectedAudio,
}: FilterBarProps) {
  const filters: { value: typeof activeFilter; label: string }[] = [
    { value: 'all', label: 'All Schedule' },
    { value: 'today', label: 'Airing Today' },
    { value: 'tomorrow', label: 'Airing Tomorrow' },
    { value: 'week', label: 'Airing This Week' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mb-6 relative z-10 select-none">
      <div className="bg-surface border border-border p-4 rounded-3xl shadow-xs flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Day Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-4.5 py-2.5 rounded-2xl text-xs font-black tracking-tight card-transition border ${
                activeFilter === filter.value
                  ? 'bg-accent border-primary/30 text-primary shadow-xs'
                  : 'bg-background border-border text-muted hover:border-primary/30 hover:text-primary'
              }`}
            >
              {filter.value === 'today' && <span className="mr-1">🌸</span>}
              {filter.value === 'tomorrow' && <span className="mr-1">☀️</span>}
              {filter.value === 'week' && <span className="mr-1">📅</span>}
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Panel */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center flex-grow lg:flex-grow-0 max-w-4xl">
          {/* Search Input */}
          <div className="relative flex-grow sm:flex-grow-0 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, senpai..."
              className="w-full bg-background border border-border rounded-2xl pl-10 pr-9 py-2.5 text-xs font-bold text-foreground placeholder-muted/50 focus:outline-hidden focus:border-primary/40 focus:ring-1 focus:ring-primary/20 card-transition"
            />
            <Search 
              size={16} 
              className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted/50" 
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-0.5 hover:bg-accent rounded-full text-muted/60 hover:text-primary transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Genre Dropdown */}
          <div className="relative flex-shrink-0">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="appearance-none bg-background border border-border rounded-2xl pl-4 pr-10 py-2.5 text-xs font-black text-foreground focus:outline-hidden focus:border-primary/40 cursor-pointer shadow-xs"
            >
              <option value="all">All Genres</option>
              {availableGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
            <ChevronDown 
              size={14} 
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-muted/50 pointer-events-none" 
            />
          </div>

          {/* Platform Dropdown */}
          <div className="relative flex-shrink-0">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="appearance-none bg-background border border-border rounded-2xl pl-4 pr-10 py-2.5 text-xs font-black text-foreground focus:outline-hidden focus:border-primary/40 cursor-pointer shadow-xs"
            >
              <option value="all">All Streaming Sites</option>
              <option value="crunchyroll">Crunchyroll</option>
              <option value="netflix">Netflix</option>
              <option value="hidive">HIDIVE</option>
            </select>
            <ChevronDown 
              size={14} 
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-muted/50 pointer-events-none" 
            />
          </div>

          {/* Sub/Dub Dropdown */}
          <div className="relative flex-shrink-0">
            <select
              value={selectedAudio}
              onChange={(e) => setSelectedAudio(e.target.value)}
              className="appearance-none bg-background border border-border rounded-2xl pl-4 pr-10 py-2.5 text-xs font-black text-foreground focus:outline-hidden focus:border-primary/40 cursor-pointer shadow-xs"
            >
              <option value="all">Sub & Dub</option>
              <option value="sub">Subbed Only</option>
              <option value="dub">Dubbed Only</option>
            </select>
            <ChevronDown 
              size={14} 
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-muted/50 pointer-events-none" 
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-background border border-border rounded-2xl pl-10 pr-10 py-2.5 text-xs font-black text-foreground focus:outline-hidden focus:border-primary/40 cursor-pointer shadow-xs"
            >
              <option value="soon">Soonest Airing First</option>
              <option value="alpha">Alphabetical (A-Z)</option>
              <option value="popular">Most Popular</option>
            </select>
            {/* Sort Icons */}
            {sortBy === 'soon' && (
              <Clock size={15} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-primary" />
            )}
            {sortBy === 'alpha' && (
              <SortAsc size={15} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-primary" />
            )}
            {sortBy === 'popular' && (
              <Sparkles size={15} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-primary" />
            )}
            <ChevronDown 
              size={14} 
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-muted/50 pointer-events-none" 
            />
          </div>
        </div>

      </div>
    </div>
  );
}
