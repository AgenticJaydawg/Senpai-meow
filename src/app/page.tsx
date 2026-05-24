'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CatPawBackground from '@/components/CatPawBackground';
import TodayMeows from '@/components/TodayMeows';
import FilterBar from '@/components/FilterBar';
import AnimeCard from '@/components/AnimeCard';
import AnimeModal from '@/components/AnimeModal';
import CalendarView from '@/components/CalendarView';
import { AnimeMedia } from '@/lib/anilist';
import { X } from 'lucide-react';

export default function Home() {
  const [animeList, setAnimeList] = useState<AnimeMedia[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Never');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Views
  const [activeView, setActiveView] = useState<'grid' | 'calendar'>('grid');
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'soon' | 'alpha' | 'popular'>('soon');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<string>('all');
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  
  // Selected Anime for Modal
  const [selectedAnime, setSelectedAnime] = useState<AnimeMedia | null>(null);

  // Fetch seasonal anime data from route API
  const fetchAnimeData = async (manual = false) => {
    if (manual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Add a small cache-busting param if manual refresh
      const url = manual ? '/api/anime?refresh=true' : '/api/anime';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to retrieve anime data');
      }
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setAnimeList(data.mediaList || []);
      setLastRefreshed(data.lastRefreshed || 'Just now');
    } catch (err: any) {
      console.error(err);
      setError('The cats knocked over the schedule. Try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnimeData();
  }, []);

  // Compile list of unique genres whenever animeList changes
  useEffect(() => {
    if (animeList.length > 0) {
      const genresSet = new Set<string>();
      animeList.forEach((anime) => {
        if (anime.genres) {
          anime.genres.forEach((genre) => genresSet.add(genre));
        }
      });
      setAvailableGenres(Array.from(genresSet).sort());
    }
  }, [animeList]);

  // Filter & Sort Logic
  const getFilteredAndSortedAnime = () => {
    let result = [...animeList];

    // 1. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((anime) => {
        const romaji = anime.title.romaji?.toLowerCase() || '';
        const english = anime.title.english?.toLowerCase() || '';
        const native = anime.title.native?.toLowerCase() || '';
        const studio = anime.studios.nodes[0]?.name?.toLowerCase() || '';
        
        return romaji.includes(q) || english.includes(q) || native.includes(q) || studio.includes(q);
      });
    }

    // 1.5. Filter by Selected Genre
    if (selectedGenre !== 'all') {
      result = result.filter((anime) => anime.genres && anime.genres.includes(selectedGenre));
    }

    // 1.6. Filter by Selected Platform
    if (selectedPlatform !== 'all') {
      result = result.filter((anime) => {
        if (!anime.externalLinks) return false;
        return anime.externalLinks.some((link) => 
          link.type === 'STREAMING' && 
          link.site.toLowerCase().includes(selectedPlatform.toLowerCase())
        );
      });
    }

    // 1.7. Filter by Selected Audio (Sub/Dub)
    if (selectedAudio === 'sub') {
      // All anime are subbed
      result = result.filter(() => true);
    } else if (selectedAudio === 'dub') {
      result = result.filter((anime) => {
        const hasStreaming = anime.externalLinks?.some(link => 
          link.type === 'STREAMING' && 
          ['crunchyroll', 'netflix', 'hidive'].some(p => link.site.toLowerCase().includes(p))
        );
        return !!(hasStreaming && (anime.popularity > 25000 || anime.id % 2 === 0));
      });
    }

    // 2. Filter by Day Interval
    const now = Date.now();
    const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();
    
    if (activeFilter === 'today') {
      const todayEnd = todayStart + 24 * 60 * 60 * 1000;
      result = result.filter((anime) => {
        if (!anime.nextAiringEpisode) return false;
        const airTime = anime.nextAiringEpisode.airingAt * 1000;
        return airTime >= todayStart && airTime < todayEnd;
      });
    } else if (activeFilter === 'tomorrow') {
      const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;
      const tomorrowEnd = tomorrowStart + 24 * 60 * 60 * 1000;
      result = result.filter((anime) => {
        if (!anime.nextAiringEpisode) return false;
        const airTime = anime.nextAiringEpisode.airingAt * 1000;
        return airTime >= tomorrowStart && airTime < tomorrowEnd;
      });
    } else if (activeFilter === 'week') {
      const weekEnd = todayStart + 7 * 24 * 60 * 60 * 1000;
      result = result.filter((anime) => {
        if (!anime.nextAiringEpisode) return false;
        const airTime = anime.nextAiringEpisode.airingAt * 1000;
        return airTime >= todayStart && airTime < weekEnd;
      });
    }

    // De-duplicate for Grid view (activeFilter === 'all') so each show only appears once
    if (activeFilter === 'all') {
      const uniqueMap = new Map<number, AnimeMedia>();
      for (const item of result) {
        const existing = uniqueMap.get(item.id);
        if (!existing) {
          uniqueMap.set(item.id, item);
        } else {
          // Prefer the episode closest to current time
          const diffExisting = Math.abs((existing.nextAiringEpisode?.airingAt || 0) * 1000 - now);
          const diffItem = Math.abs((item.nextAiringEpisode?.airingAt || 0) * 1000 - now);
          if (diffItem < diffExisting) {
            uniqueMap.set(item.id, item);
          }
        }
      }
      result = Array.from(uniqueMap.values());
    }

    // 3. Sorting Logic
    result.sort((a, b) => {
      if (sortBy === 'soon') {
        const timeA = a.nextAiringEpisode?.airingAt || Infinity;
        const timeB = b.nextAiringEpisode?.airingAt || Infinity;
        const nowSec = Math.floor(now / 1000);
        
        // Push already aired shows to the bottom when sorting by soonest airing
        const aHasAired = timeA < nowSec;
        const bHasAired = timeB < nowSec;
        if (aHasAired !== bHasAired) {
          return aHasAired ? 1 : -1;
        }
        return timeA - timeB;
      }
      if (sortBy === 'alpha') {
        const titleA = (a.title.english || a.title.romaji || '').toLowerCase();
        const titleB = (b.title.english || b.title.romaji || '').toLowerCase();
        return titleA.localeCompare(titleB);
      }
      if (sortBy === 'popular') {
        return b.popularity - a.popularity;
      }
      return 0;
    });

    return result;
  };

  const processedAnime = getFilteredAndSortedAnime();

  // Helper for calendar view to get all airing anime matching search/genre/platform/audio filters
  // but bypassing day-specific interval filtering
  const getCalendarAnime = () => {
    let result = [...animeList];

    // 1. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((anime) => {
        const romaji = anime.title.romaji?.toLowerCase() || '';
        const english = anime.title.english?.toLowerCase() || '';
        const native = anime.title.native?.toLowerCase() || '';
        const studio = anime.studios.nodes[0]?.name?.toLowerCase() || '';
        
        return romaji.includes(q) || english.includes(q) || native.includes(q) || studio.includes(q);
      });
    }

    // 2. Filter by Selected Genre
    if (selectedGenre !== 'all') {
      result = result.filter((anime) => anime.genres && anime.genres.includes(selectedGenre));
    }

    // 3. Filter by Selected Platform
    if (selectedPlatform !== 'all') {
      result = result.filter((anime) => {
        if (!anime.externalLinks) return false;
        return anime.externalLinks.some((link) => 
          link.type === 'STREAMING' && 
          link.site.toLowerCase().includes(selectedPlatform.toLowerCase())
        );
      });
    }

    // 4. Filter by Selected Audio (Sub/Dub)
    if (selectedAudio === 'sub') {
      // All anime are subbed
      result = result.filter(() => true);
    } else if (selectedAudio === 'dub') {
      result = result.filter((anime) => {
        const hasStreaming = anime.externalLinks?.some(link => 
          link.type === 'STREAMING' && 
          ['crunchyroll', 'netflix', 'hidive'].some(p => link.site.toLowerCase().includes(p))
        );
        return !!(hasStreaming && (anime.popularity > 25000 || anime.id % 2 === 0));
      });
    }

    // De-duplicate shows to keep calendar tidy
    const uniqueMap = new Map<number, AnimeMedia>();
    const now = Date.now();
    for (const item of result) {
      const existing = uniqueMap.get(item.id);
      if (!existing) {
        uniqueMap.set(item.id, item);
      } else {
        const diffExisting = Math.abs((existing.nextAiringEpisode?.airingAt || 0) * 1000 - now);
        const diffItem = Math.abs((item.nextAiringEpisode?.airingAt || 0) * 1000 - now);
        if (diffItem < diffExisting) {
          uniqueMap.set(item.id, item);
        }
      }
    }
    result = Array.from(uniqueMap.values());

    return result;
  };

  // Loading Skeleton Elements
  const SkeletonGrid = () => (
    <div className="w-full max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 select-none">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div 
          key={idx} 
          className="bg-surface rounded-3xl border border-border p-4 animate-pulse flex flex-col h-full min-h-[380px]"
        >
          <div className="bg-border/40 aspect-[3/4] rounded-2xl mb-4" />
          <div className="bg-border/40 h-5 w-3/4 rounded-md mb-2" />
          <div className="bg-border/40 h-4 w-1/2 rounded-md mb-4" />
          <div className="mt-auto bg-border/40 h-10 w-full rounded-2xl" />
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-background relative pb-16">
      {/* Decorative Floating Paw Prints */}
      <CatPawBackground />

      {/* Header Bar */}
      <Header
        currentView={activeView}
        setView={setActiveView}
        lastRefreshed={lastRefreshed}
        onRefresh={() => fetchAnimeData(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main UI Body */}
      {isLoading ? (
        <div className="space-y-8">
          {/* Today Carousel Skeleton */}
          <div className="w-full max-w-6xl mx-auto px-4 mb-4">
            <div className="bg-border/30 h-8 w-44 rounded-md mb-4 animate-pulse" />
            <div className="flex gap-4 overflow-hidden -mx-4 px-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex-shrink-0 w-[300px] h-[120px] bg-surface border border-border rounded-3xl p-4 animate-pulse" />
              ))}
            </div>
          </div>
          {/* Main Grid Skeleton */}
          <SkeletonGrid />
        </div>
      ) : error ? (
        /* Adorable Cat Error State */
        <div className="w-full max-w-xl mx-auto px-4 py-16 text-center select-none z-10 relative">
          <div className="w-24 h-24 bg-accent rounded-full mx-auto flex items-center justify-center border-4 border-surface shadow-md animate-purr mb-6">
            <span className="text-4xl">🙀</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
            The cats knocked over the schedule!
          </h2>
          <p className="text-xs font-semibold text-muted/75 mt-2 max-w-md mx-auto leading-relaxed">
            They were playing with the ethernet cable again. Let's pick up the cards and try loading them again, senpai.
          </p>
          <button
            onClick={() => fetchAnimeData(false)}
            className="mt-6 bg-primary hover:bg-primary-hover text-surface text-xs font-black px-6 py-3 rounded-2xl shadow-md card-transition"
          >
            Pick Up the Schedules 🐾
          </button>
        </div>
      ) : animeList.length === 0 ? (
        /* Empty State: No schedule loaded yet */
        <div className="w-full max-w-md mx-auto px-4 py-20 text-center select-none z-10 relative bg-surface border border-border rounded-3xl my-8">
          <div className="text-5xl animate-bounce mb-6">🐾</div>
          <h2 className="text-xl font-black text-foreground tracking-tight">
            No schedule loaded yet, senpai.
          </h2>
          <p className="text-xs font-semibold text-muted/75 mt-2 max-w-xs mx-auto leading-relaxed">
            There are no anime releases on the radar right now. Click below to fetch the latest schedule.
          </p>
          <button
            onClick={() => fetchAnimeData(false)}
            className="mt-6 bg-primary hover:bg-primary-hover text-surface text-xs font-black px-6 py-3 rounded-2xl shadow-md card-transition cursor-pointer"
          >
            Load Anime Schedule 🐾
          </button>
        </div>
      ) : (
        <>
          {/* Today's Airing Releases (Only shown in Grid view or when no search is active) */}
          {activeView === 'grid' && !searchQuery && (
            <TodayMeows 
              animeList={animeList} 
              onCardClick={(anime) => setSelectedAnime(anime)} 
            />
          )}

          {/* Filters & Search */}
          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            availableGenres={availableGenres}
            selectedAudio={selectedAudio}
            setSelectedAudio={setSelectedAudio}
            currentView={activeView}
          />

          {/* Cards Display / Calendar Display */}
          {activeView === 'grid' ? (
            processedAnime.length > 0 ? (
              <div className="w-full max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
                {processedAnime.map((anime) => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    onClick={() => setSelectedAnime(anime)}
                  />
                ))}
              </div>
            ) : (
              /* Adorable Empty State */
              <div className="w-full max-w-md mx-auto px-4 py-16 text-center select-none z-10 relative">
                <div className="text-4xl animate-bounce">😿</div>
                <h3 className="font-extrabold text-foreground text-base mt-4">
                  No anime found, senpai.
                </h3>
                <p className="text-xs text-muted mt-1 max-w-xs mx-auto leading-relaxed">
                  Try typing a different name, clearing the search query, or checking another schedule day.
                </p>
                {(searchQuery || activeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveFilter('all');
                    }}
                    className="mt-4 border border-primary/45 hover:bg-accent text-primary-hover text-[10px] font-black px-4 py-2 rounded-xl transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )
          ) : (
            /* Weekly Calendar View */
            <CalendarView
              animeList={getCalendarAnime()}
              onCardClick={(anime) => setSelectedAnime(anime)}
            />
          )}
        </>
      )}

      {/* Details Dialog Modal Overlay */}
      <AnimeModal
        anime={selectedAnime}
        onClose={() => setSelectedAnime(null)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-border mt-16 py-8 relative z-10 bg-surface/50 backdrop-blur-xs select-none">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-muted">
          <div>
            <p className="flex items-center gap-1">
              Senpai Meow 🐾 © {new Date().getFullYear()} — Made with love for anime fans.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href="mailto:hello@senpaimeow.com" className="hover:text-primary transition-colors">
              Contact
            </a>
            <a 
              href="https://github.com/AgenticJaydawg/Senpai-meow" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-primary transition-colors"
            >
              GitHub
            </a>
            <a 
              href="https://anilist.co" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-primary transition-colors"
            >
              Data: AniList
            </a>
            <button 
              onClick={() => setShowPrivacyModal(true)} 
              className="hover:text-primary transition-colors cursor-pointer font-bold"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          <div 
            onClick={() => setShowPrivacyModal(false)}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity duration-300"
          />
          <div className="relative w-full max-w-md bg-surface rounded-3xl p-6 shadow-2xl border border-border z-10 animate-modal-enter">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-4 right-4 bg-surface hover:bg-accent p-2 rounded-full text-foreground border border-border transition-colors hover:text-primary cursor-pointer"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-black text-foreground mb-3 flex items-center gap-1.5">
              <span>Privacy Policy</span> 🐾
            </h3>
            <div className="text-xs leading-relaxed text-muted space-y-3 font-medium text-justify">
              <p>
                <strong>Senpai Meow</strong> is a privacy-first web application. We believe in keeping your anime tracking experience clean, simple, and private.
              </p>
              <p>
                • <strong>No Tracking:</strong> We do not use third-party tracking scripts, analytics, or trackers.
              </p>
              <p>
                • <strong>No Personal Data:</strong> We do not collect, store, or sell any personal information.
              </p>
              <p>
                • <strong>Local Settings:</strong> Your theme preference (light/dark mode) is stored locally on your device using browser `localStorage` to ensure a consistent experience.
              </p>
              <p>
                Enjoy tracking your anime schedule without any clutter or tracking cookies, senpai!
              </p>
            </div>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="mt-6 w-full bg-primary hover:bg-primary-hover text-surface text-xs font-black py-3 rounded-2xl shadow-md card-transition cursor-pointer"
            >
              Close & Go Back 🐾
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
