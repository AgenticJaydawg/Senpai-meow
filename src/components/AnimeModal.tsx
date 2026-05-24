import React, { useEffect, useState } from 'react';
import { X, Calendar, Play, ExternalLink, Users } from 'lucide-react';
import { AnimeMedia } from '@/lib/anilist';

interface AnimeModalProps {
  anime: AnimeMedia | null;
  onClose: () => void;
}

export default function AnimeModal({ anime, onClose }: AnimeModalProps) {
  const [trailerId, setTrailerId] = useState<string | null>(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (anime) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [anime]);

  // Fetch Crunchyroll trailer on-demand
  useEffect(() => {
    if (!anime) {
      setTrailerId(null);
      setLoadingTrailer(false);
      return;
    }

    const title = anime.title.english || anime.title.romaji || anime.title.native;
    setLoadingTrailer(true);

    fetch(`/api/anime/trailer?title=${encodeURIComponent(title)}`)
      .then(res => res.json())
      .then(data => {
        if (data.trailerId) {
          setTrailerId(data.trailerId);
        } else {
          // Fallback to AniList trailer if Crunchyroll search returned nothing
          const defaultTrailerId = anime.trailer && anime.trailer.site === 'youtube' ? anime.trailer.id : null;
          setTrailerId(defaultTrailerId);
        }
      })
      .catch(err => {
        console.error('Failed to fetch Crunchyroll trailer:', err);
        // Fallback to AniList trailer
        const defaultTrailerId = anime.trailer && anime.trailer.site === 'youtube' ? anime.trailer.id : null;
        setTrailerId(defaultTrailerId);
      })
      .finally(() => {
        setLoadingTrailer(false);
      });
  }, [anime]);

  if (!anime) return null;

  const title = anime.title.english || anime.title.romaji || anime.title.native;
  const nativeTitle = anime.title.native;
  const romajiTitle = anime.title.romaji;
  
  // Determine if dubbed
  const hasStreaming = anime.externalLinks?.some(link => 
    link.type === 'STREAMING' && 
    ['crunchyroll', 'netflix', 'hidive'].some(p => link.site.toLowerCase().includes(p))
  );
  const isDubbed = !!(hasStreaming && (anime.popularity > 25000 || anime.id % 2 === 0));
  
  // Format release time
  const getLocalReleaseString = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-surface rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col max-h-[90vh] z-10 animate-modal-enter">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-25 bg-surface/80 hover:bg-accent p-2.5 rounded-full text-foreground border border-border transition-colors hover:text-primary"
        >
          <X size={18} />
        </button>

        {/* Content Pane (Scrollable) */}
        <div className="overflow-y-auto flex-grow scrollbar-thin">
          {/* Header Banner */}
          <div className="relative h-44 md:h-52 bg-border/30">
            {/* Blurry Background image banner */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={anime.coverImage.extraLarge || anime.coverImage.large}
                alt="Banner background"
                className="w-full h-full object-cover blur-md scale-110 opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
            </div>
          </div>

          {/* Details Section */}
          <div className="px-6 pb-6 relative -mt-20 md:-mt-24 flex flex-col md:flex-row gap-6">
            {/* Image (Floating) */}
            <div className="w-36 md:w-44 aspect-[3/4] rounded-2xl overflow-hidden border-4 border-surface shadow-lg bg-border/40 flex-shrink-0 mx-auto md:mx-0">
              <img
                src={anime.coverImage.extraLarge || anime.coverImage.large}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description & Metadata */}
            <div className="flex-grow flex flex-col justify-end pt-4 md:pt-20 text-center md:text-left">
              {/* Titles */}
              <h2 className="text-xl md:text-2xl font-black text-foreground leading-tight">
                {title}
              </h2>
              {romajiTitle !== title && (
                <p className="text-xs font-semibold text-muted mt-1">{romajiTitle}</p>
              )}
              {nativeTitle && nativeTitle !== title && nativeTitle !== romajiTitle && (
                <p className="text-[10px] font-bold text-muted/50 mt-0.5">{nativeTitle}</p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                <span className="text-[10px] font-black bg-accent text-primary px-3 py-1 rounded-full uppercase tracking-wider">
                  {anime.format}
                </span>
                <span className="text-[10px] font-black bg-border text-foreground px-3 py-1 rounded-full uppercase tracking-wider">
                  {anime.status}
                </span>
                {anime.studios.nodes[0] && (
                  <span className="text-[10px] font-black bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full tracking-wider border border-orange-500/20">
                    {anime.studios.nodes[0].name}
                  </span>
                )}
                <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full tracking-wider border border-blue-500/20 flex items-center gap-1">
                  <Users size={10} />
                  {(anime.popularity / 1000).toFixed(0)}k Popularity
                </span>
                <span className="text-[10px] font-black bg-green-500/10 text-green-600 px-3 py-1 rounded-full tracking-wider border border-green-500/20">
                  Sub
                </span>
                {isDubbed && (
                  <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-600 px-3 py-1 rounded-full tracking-wider border border-indigo-500/20">
                    Dub
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="px-6 pb-8 space-y-6">
            {/* Airing Schedule info */}
            {anime.nextAiringEpisode && (
              <div className="bg-accent/45 border border-border/15 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-primary flex items-center gap-1">
                    <Calendar size={12} /> Upcoming Airing
                  </span>
                  <p className="text-sm font-black text-foreground">
                    Episode {anime.nextAiringEpisode.episode}
                  </p>
                  <p className="text-xs text-muted font-semibold">
                    {getLocalReleaseString(anime.nextAiringEpisode.airingAt)}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center bg-surface px-4 py-2.5 rounded-xl border border-primary/20 text-primary">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary/65">Time Until</span>
                  <span className="text-sm font-black tracking-tight mt-0.5">
                    {Math.floor(anime.nextAiringEpisode.timeUntilAiring / 86400)}d:{' '}
                    {Math.floor((anime.nextAiringEpisode.timeUntilAiring % 86400) / 3600)}h:{' '}
                    {Math.floor((anime.nextAiringEpisode.timeUntilAiring % 3600) / 60)}m
                  </span>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-sm font-extrabold text-foreground uppercase tracking-wider border-b border-border pb-1.5">
                Description
              </h4>
              <p 
                className="text-xs leading-relaxed text-muted font-medium text-justify"
                dangerouslySetInnerHTML={{ __html: anime.description || 'No description available, senpai.' }}
              />
            </div>

            {/* Genres */}
            <div className="space-y-2">
              <h4 className="text-sm font-extrabold text-foreground uppercase tracking-wider border-b border-border pb-1.5">
                Genres
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {anime.genres.map((genre) => (
                  <span 
                    key={genre}
                    className="text-xs font-bold text-muted bg-background border border-border px-3.5 py-1.5 rounded-2xl hover:border-primary/30 transition-colors"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Trailer Embed */}
            {(trailerId || loadingTrailer) && (
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-foreground uppercase tracking-wider border-b border-border pb-1.5 flex items-center gap-1.5">
                  <Play size={14} className="text-primary" /> Crunchyroll Trailer
                </h4>
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-md border border-border bg-black">
                  {loadingTrailer && !trailerId ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-hover/80 text-muted gap-2 z-10">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-foreground">Finding Crunchyroll Trailer...</span>
                    </div>
                  ) : null}
                  {trailerId && (
                    <iframe
                      src={`https://www.youtube.com/embed/${trailerId}`}
                      title={`${title} Crunchyroll Trailer`}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-background border-t border-border px-6 py-4 flex items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-muted/50">
            Data provided by AniList 🐾
          </p>
          <a
            href={anime.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-surface text-xs font-black px-5 py-2.5 rounded-2xl shadow-sm card-transition"
          >
            <span>View on AniList</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
