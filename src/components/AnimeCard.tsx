import React, { useState, useEffect } from 'react';
import { Clock, Play, Sparkles } from 'lucide-react';
import { AnimeMedia } from '@/lib/anilist';

interface AnimeCardProps {
  anime: AnimeMedia;
  onClick: () => void;
}

export default function AnimeCard({ anime, onClick }: AnimeCardProps) {
  const nextEp = anime.nextAiringEpisode;
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);
  const [airingStatus, setAiringStatus] = useState<'Today' | 'Tomorrow' | 'This Week' | 'Unknown' | 'Aired'>('Unknown');

  // Format local release time: "Wednesday, 8:30 PM"
  const getLocalReleaseString = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  useEffect(() => {
    if (!nextEp) {
      setAiringStatus('Unknown');
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const difference = nextEp.airingAt * 1000 - now;

      if (difference <= 0) {
        setTimeLeft(null);
        setAiringStatus('Aired');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      setTimeLeft({ days, hours, minutes });

      // Determine visual badge status based on local time
      const nowDate = new Date();
      const airingDate = new Date(nextEp.airingAt * 1000);

      const today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
      const target = new Date(airingDate.getFullYear(), airingDate.getMonth(), airingDate.getDate());
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        setAiringStatus('Today');
      } else if (diffDays === 1) {
        setAiringStatus('Tomorrow');
      } else if (diffDays > 1 && diffDays <= 7) {
        setAiringStatus('This Week');
      } else {
        setAiringStatus('Unknown');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [nextEp]);

  const title = anime.title.english || anime.title.romaji || anime.title.native;
  const cardBorderColor = anime.coverImage.color || 'var(--primary)';

  return (
    <div
      onClick={onClick}
      className="group bg-surface rounded-3xl border border-border p-4 cursor-pointer card-transition hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full select-none"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4 bg-zinc-100 dark:bg-zinc-800 shadow-inner">
        <img
          src={anime.coverImage.extraLarge || anime.coverImage.large}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Popularity indicator (top right) */}
        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-1 rounded-full flex items-center gap-1">
          <Sparkles size={10} className="text-yellow-300" />
          <span>{(anime.popularity / 1000).toFixed(1)}k</span>
        </div>

        {/* Airing badge (top left) */}
        {nextEp && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span
              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md text-white ${
                airingStatus === 'Today'
                  ? 'bg-primary'
                  : airingStatus === 'Tomorrow'
                  ? 'bg-orange-400'
                  : airingStatus === 'This Week'
                  ? 'bg-blue-400'
                  : airingStatus === 'Aired'
                  ? 'bg-zinc-500'
                  : 'bg-zinc-400'
              }`}
            >
              {airingStatus === 'Aired' ? 'Just Aired' : `Airing ${airingStatus}`}
            </span>
          </div>
        )}

        {/* Format Badge (bottom left) */}
        <div className="absolute bottom-2 left-2 bg-black/55 backdrop-blur-xs text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
          {anime.format}
        </div>

        {/* Play Icon Hover Overlay */}
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play size={20} fill="currentColor" className="ml-1" />
          </div>
        </div>
      </div>

      {/* Info & Content */}
      <div className="flex flex-col flex-grow">
        {/* Title */}
        <h3 className="font-extrabold text-foreground text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Release & Countdown */}
        {nextEp ? (
          <div className="mt-auto space-y-3">
            {/* Local release time */}
            <div className="text-xs font-semibold text-muted flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-wider text-muted/60 font-bold">
                Local Release
              </span>
              <span className="flex items-center gap-1.5 text-foreground font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {getLocalReleaseString(nextEp.airingAt)}
              </span>
            </div>

            {/* Countdown Badge */}
            {timeLeft ? (
              <div className="bg-accent/80 border border-primary/20 rounded-2xl py-2 px-3 flex items-center justify-between text-primary-hover">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-primary" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wide">
                    Ep {nextEp.episode} In
                  </span>
                </div>
                <div className="flex gap-1.5 text-xs font-black tracking-tight text-primary">
                  {timeLeft.days > 0 && (
                    <span>
                      {timeLeft.days}
                      <span className="text-[9px] font-medium ml-0.5 text-primary/70">d</span>
                    </span>
                  )}
                  <span>
                    {timeLeft.hours}
                    <span className="text-[9px] font-medium ml-0.5 text-primary/70">h</span>
                  </span>
                  <span>
                    {timeLeft.minutes}
                    <span className="text-[9px] font-medium ml-0.5 text-primary/70">m</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-accent/30 border border-border rounded-2xl py-2 px-3 text-center text-xs font-extrabold text-muted">
                Released / Broadcasted
              </div>
            )}
          </div>
        ) : (
          <div className="mt-auto pt-4 text-center">
            <span className="text-xs font-extrabold text-muted bg-border/50 px-3 py-1.5 rounded-full inline-block">
              Schedule unknown
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
