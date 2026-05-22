import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { AnimeMedia } from '@/lib/anilist';

interface CalendarViewProps {
  animeList: AnimeMedia[];
  onCardClick: (anime: AnimeMedia) => void;
}

const DISPLAY_DAYS = [
  { index: 1, label: 'Mon', fullLabel: 'Monday' },
  { index: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { index: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { index: 4, label: 'Thu', fullLabel: 'Thursday' },
  { index: 5, label: 'Fri', fullLabel: 'Friday' },
  { index: 6, label: 'Sat', fullLabel: 'Saturday' },
  { index: 0, label: 'Sun', fullLabel: 'Sunday' },
];

export default function CalendarView({ animeList, onCardClick }: CalendarViewProps) {
  // Determine today's day index (0 = Sun, 1 = Mon...)
  const getTodayDayIndex = () => {
    return new Date().getDay();
  };

  const [activeMobileDay, setActiveMobileDay] = useState<number>(1);
  const [groupedAnime, setGroupedAnime] = useState<Record<number, AnimeMedia[]>>({
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  });

  // Set initial active day to today
  useEffect(() => {
    setActiveMobileDay(getTodayDayIndex());
  }, []);

  useEffect(() => {
    const groups: Record<number, AnimeMedia[]> = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    };

    animeList.forEach((anime) => {
      if (!anime.nextAiringEpisode) return;
      const date = new Date(anime.nextAiringEpisode.airingAt * 1000);
      const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday...
      groups[dayIndex].push(anime);
    });

    // Sort each day by airing time
    Object.keys(groups).forEach((key) => {
      const idx = Number(key);
      groups[idx].sort((a, b) => {
        const timeA = a.nextAiringEpisode?.airingAt || 0;
        const timeB = b.nextAiringEpisode?.airingAt || 0;
        return timeA - timeB;
      });
    });

    setGroupedAnime(groups);
  }, [animeList]);

  // Mini-component for a compact calendar cell/card
  const CompactCard = ({ anime }: { anime: AnimeMedia }) => {
    const title = anime.title.english || anime.title.romaji || anime.title.native;
    const nextEp = anime.nextAiringEpisode;
    const airingTimeStr = nextEp
      ? new Date(nextEp.airingAt * 1000).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      : '';

    return (
      <div
        onClick={() => onCardClick(anime)}
        className="bg-surface border border-border p-2.5 rounded-2xl cursor-pointer hover:border-primary/30 hover:shadow-md card-transition flex items-center gap-2.5 select-none"
      >
        <img
          src={anime.coverImage.large}
          alt={title}
          className="w-10 h-14 object-cover rounded-lg flex-shrink-0 bg-border/30"
        />
        <div className="flex-grow min-w-0">
          <h4 className="font-extrabold text-foreground text-xs truncate" title={title}>
            {title}
          </h4>
          <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-muted">
            <span className="text-primary bg-accent/80 px-1.5 py-0.5 rounded-md flex-shrink-0">
              Ep {nextEp?.episode}
            </span>
            <span className="flex items-center gap-0.5 truncate text-muted/80">
              <Clock size={8} />
              {airingTimeStr}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mb-10 relative z-10">
      
      {/* 1. MOBILE VIEW (Tabs + Selected Day column) */}
      <div className="block lg:hidden">
        {/* Tab Buttons bar */}
        <div className="flex bg-accent/45 p-1 rounded-2xl border border-border overflow-x-auto gap-1 mb-4 scrollbar-none">
          {DISPLAY_DAYS.map((day) => {
            const isToday = getTodayDayIndex() === day.index;
            return (
              <button
                key={day.index}
                onClick={() => setActiveMobileDay(day.index)}
                className={`flex-grow text-center py-2.5 px-3 rounded-xl text-xs font-black tracking-tight card-transition flex-shrink-0 relative ${
                  activeMobileDay === day.index
                    ? 'bg-primary text-surface shadow-sm'
                    : 'text-muted hover:text-primary hover:bg-accent/50'
                }`}
              >
                {day.label}
                {isToday && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-300" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day content */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-4 bg-primary rounded-full" />
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              {DISPLAY_DAYS.find((d) => d.index === activeMobileDay)?.fullLabel} Releases
            </h3>
            <span className="text-[10px] font-black bg-accent text-primary px-2 py-0.5 rounded-md">
              {groupedAnime[activeMobileDay].length} Shows
            </span>
          </div>
          {groupedAnime[activeMobileDay].length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groupedAnime[activeMobileDay].map((anime) => (
                <CompactCard key={anime.id} anime={anime} />
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border p-8 rounded-2xl text-center">
              <span className="text-xl">🐱</span>
              <p className="text-xs text-muted mt-1 font-semibold">No releases scheduled for today, senpai.</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. DESKTOP VIEW (7 Columns Side-by-Side) */}
      <div className="hidden lg:grid grid-cols-7 gap-3">
        {DISPLAY_DAYS.map((day) => {
          const isToday = getTodayDayIndex() === day.index;
          const shows = groupedAnime[day.index];

          return (
            <div 
              key={day.index} 
              className={`flex flex-col rounded-3xl border p-3 min-h-[400px] ${
                isToday 
                  ? 'bg-accent/25 border-primary/35 shadow-xs' 
                  : 'bg-surface border-border'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
                <span className="font-black text-foreground text-xs tracking-wider uppercase flex items-center gap-1.5">
                  {day.fullLabel}
                  {isToday && (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" title="Today!" />
                  )}
                </span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  shows.length > 0 
                    ? 'bg-border text-foreground/80' 
                    : 'bg-border/40 text-muted/40'
                }`}>
                  {shows.length}
                </span>
              </div>

              {/* Column Cells */}
              <div className="flex-grow space-y-2 overflow-y-auto max-h-[500px] pr-0.5 scrollbar-thin">
                {shows.length > 0 ? (
                  shows.map((anime) => (
                    <CompactCard key={anime.id} anime={anime} />
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-border/60 rounded-2xl py-8 px-2 text-center select-none">
                    <p className="text-[10px] text-muted/40 font-semibold italic">No releases</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
