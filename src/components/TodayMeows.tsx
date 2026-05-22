import React, { useState, useEffect } from 'react';
import { AnimeMedia } from '@/lib/anilist';

interface TodayMeowsProps {
  animeList: AnimeMedia[];
  onCardClick: (anime: AnimeMedia) => void;
}

export default function TodayMeows({ animeList, onCardClick }: TodayMeowsProps) {
  const [todayAnime, setTodayAnime] = useState<AnimeMedia[]>([]);

  useEffect(() => {
    // Filter anime airing today (local timezone calendar day)
    const checkAiringToday = () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const todayEnd = todayStart + 24 * 60 * 60 * 1000;

      const filtered = animeList.filter((item) => {
        if (!item.nextAiringEpisode) return false;
        const airingTime = item.nextAiringEpisode.airingAt * 1000;
        return airingTime >= todayStart && airingTime < todayEnd;
      });

      // Sort by soonest airing
      filtered.sort((a, b) => {
        const timeA = a.nextAiringEpisode?.airingAt || 0;
        const timeB = b.nextAiringEpisode?.airingAt || 0;
        return timeA - timeB;
      });

      setTodayAnime(filtered);
    };

    checkAiringToday();
    const interval = setInterval(checkAiringToday, 60000); // Re-check every minute

    return () => clearInterval(interval);
  }, [animeList]);

  if (todayAnime.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 mb-8">
        <div className="bg-accent/40 border border-primary/10 rounded-3xl p-6 text-center shadow-xs">
          <span className="text-2xl">💤</span>
          <h3 className="font-extrabold text-foreground text-base mt-2">No Meows Airing Today, Senpai</h3>
          <p className="text-xs text-muted mt-1">Time to catch up on your endless backlog! 🐾</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mb-8 select-none">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2.5 h-6 bg-primary rounded-full" />
        <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          Today's Meows <span className="text-primary animate-pulse">🌸</span>
        </h2>
        <span className="text-xs font-black text-primary bg-accent px-2.5 py-1 rounded-full">
          {todayAnime.length} {todayAnime.length === 1 ? 'Show' : 'Shows'} Airing
        </span>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scroll-smooth -mx-4 px-4 snap-x">
        {todayAnime.map((anime) => {
          const title = anime.title.english || anime.title.romaji || anime.title.native;
          const nextEp = anime.nextAiringEpisode;
          const localTime = nextEp
            ? new Date(nextEp.airingAt * 1000).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })
            : '';

          return (
            <div
              key={anime.id}
              onClick={() => onCardClick(anime)}
              className="flex-shrink-0 w-[290px] md:w-[350px] snap-start bg-gradient-to-br from-surface to-accent/30 rounded-3xl border border-primary/20 p-4 cursor-pointer card-transition hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 flex gap-4"
            >
              {/* Image */}
              <div className="w-20 md:w-24 aspect-[2/3] rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                <img
                  src={anime.coverImage.large}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex flex-col justify-between flex-grow py-1">
                <div>
                  <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider bg-accent px-2 py-0.5 rounded-md inline-block mb-1.5">
                    Ep {nextEp?.episode} Today
                  </span>
                  <h3 className="font-extrabold text-foreground text-sm md:text-base line-clamp-2 leading-tight">
                    {title}
                  </h3>
                </div>

                <div className="mt-2 space-y-1">
                  <p className="text-[10px] font-semibold text-muted/50 uppercase tracking-wide">
                    Airs Local Time
                  </p>
                  <p className="text-xs md:text-sm font-black text-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    {localTime}
                  </p>
                  {anime.studios.nodes[0] && (
                    <p className="text-[10px] text-muted/60 italic font-medium">
                      {anime.studios.nodes[0].name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
