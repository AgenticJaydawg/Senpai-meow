import fs from 'fs';
import path from 'path';

export interface AnimeMedia {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  coverImage: {
    large: string;
    extraLarge: string;
    color: string | null;
  };
  nextAiringEpisode: {
    airingAt: number;
    episode: number;
    timeUntilAiring: number;
  } | null;
  popularity: number;
  status: string;
  season: string;
  seasonYear: number;
  format: string;
  siteUrl: string;
  description: string | null;
  genres: string[];
  studios: {
    nodes: { name: string }[];
  };
  trailer: {
    site: string;
    id: string;
  } | null;
}

interface CacheData {
  timestamp: number;
  lastRefreshed: string;
  mediaList: AnimeMedia[];
}

const CACHE_FILE_PATH = path.join(process.cwd(), 'anilist-cache.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

// Global in-memory cache for serverless environments (like Vercel)
let inMemoryCache: CacheData | null = null;

// List of fallback anime in case both AniList API and Cache fail on first load
const FALLBACK_ANIME_DATA: AnimeMedia[] = [
  {
    id: 1,
    title: {
      romaji: "Neko ga Sukiru: Meow Adventure",
      english: "Neko Skills: Meow Adventure",
      native: "猫がスキル：にゃんアドベンチャー"
    },
    coverImage: {
      large: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=60",
      extraLarge: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=60",
      color: "#EC4899"
    },
    nextAiringEpisode: {
      airingAt: Math.floor(Date.now() / 1000) + 7200, // 2 hours from now
      episode: 5,
      timeUntilAiring: 7200
    },
    popularity: 98000,
    status: "RELEASING",
    season: "SPRING",
    seasonYear: 2026,
    format: "TV",
    siteUrl: "https://anilist.co",
    description: "A cute cat journeys through the developer's console to find the legendary git commit. A heartwarming slice-of-life anime filled with paws and compiler errors.",
    genres: ["Comedy", "Slice of Life", "Fantasy"],
    studios: {
      nodes: [{ name: "Studio Meow" }]
    },
    trailer: null
  },
  {
    id: 2,
    title: {
      romaji: "Code no Yome: Bug to no Tatakai",
      english: "My Coding Bride: Fight with Bugs",
      native: "コードの嫁：バグとの戦い"
    },
    coverImage: {
      large: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&auto=format&fit=crop&q=60",
      extraLarge: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&auto=format&fit=crop&q=60",
      color: "#3B82F6"
    },
    nextAiringEpisode: {
      airingAt: Math.floor(Date.now() / 1000) + 90000, // ~25 hours from now
      episode: 8,
      timeUntilAiring: 90000
    },
    popularity: 85000,
    status: "RELEASING",
    season: "SPRING",
    seasonYear: 2026,
    format: "TV",
    siteUrl: "https://anilist.co",
    description: "An overworked developer wakes up to find their favorite IDE theme has become a human girl. Together, they embark on a quest to resolve merge conflicts and find inner peace.",
    genres: ["Romance", "Sci-Fi", "Comedy"],
    studios: {
      nodes: [{ name: "Antigravity Animation" }]
    },
    trailer: null
  }
];

function getCurrentSeasonAndYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan, 11 = Dec
  let season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

  if (month >= 0 && month <= 2) {
    season = 'WINTER';
  } else if (month >= 3 && month <= 5) {
    season = 'SPRING';
  } else if (month >= 6 && month <= 8) {
    season = 'SUMMER';
  } else {
    season = 'FALL';
  }

  return { season, year };
}

const ANILIST_QUERY = `
  query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
      }
      media(
        season: $season,
        seasonYear: $seasonYear,
        status: RELEASING,
        type: ANIME,
        isAdult: false
      ) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          extraLarge
          color
        }
        nextAiringEpisode {
          airingAt
          episode
          timeUntilAiring
        }
        popularity
        status
        season
        seasonYear
        format
        siteUrl
        description
        genres
        studios(isMain: true) {
          nodes {
            name
          }
        }
        trailer {
          site
          id
        }
      }
    }
  }
`;

async function fetchFromAniList(season: string, year: number): Promise<AnimeMedia[]> {
  let mediaList: AnimeMedia[] = [];
  let page = 1;
  let hasNextPage = true;

  // We loop to retrieve all airing shows (in pages of 50)
  while (hasNextPage && page <= 5) { // Cap at 5 pages (250 shows) to prevent runaway loops
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: ANILIST_QUERY,
        variables: {
          season,
          seasonYear: year,
          page,
          perPage: 50,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`AniList API responded with status ${response.status}`);
    }

    const json = await response.json();
    if (json.errors) {
      throw new Error(`AniList GraphQL Error: ${json.errors[0]?.message || 'Unknown'}`);
    }

    const pageData = json.data?.Page;
    if (pageData?.media) {
      // Filter primarily for TV, TV_SHORT, ONA as requested
      const filteredMedia = pageData.media.filter((item: AnimeMedia) => {
        const fmt = item.format;
        return fmt === 'TV' || fmt === 'TV_SHORT' || fmt === 'ONA';
      });
      mediaList = [...mediaList, ...filteredMedia];
    }

    hasNextPage = pageData?.pageInfo?.hasNextPage || false;
    page++;
  }

  return mediaList;
}

export async function getSeasonalAnime(): Promise<{ mediaList: AnimeMedia[]; lastRefreshed: string; isFallback: boolean }> {
  let cached: CacheData | null = inMemoryCache;

  // 1. Try to read from cache file if in-memory is empty
  if (!cached) {
    try {
      if (fs.existsSync(CACHE_FILE_PATH)) {
        const dataStr = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
        cached = JSON.parse(dataStr);
        inMemoryCache = cached;
      }
    } catch (err) {
      console.error('Failed to read or parse AniList cache file:', err);
    }
  }

  const now = Date.now();

  // 2. Check if cache is still fresh
  if (cached && (now - cached.timestamp < CACHE_DURATION) && cached.mediaList.length > 0) {
    return {
      mediaList: cached.mediaList,
      lastRefreshed: cached.lastRefreshed,
      isFallback: false,
    };
  }

  // 3. Cache is stale or non-existent, try to fetch from AniList
  const { season, year } = getCurrentSeasonAndYear();
  try {
    const freshMediaList = await fetchFromAniList(season, year);

    if (freshMediaList.length > 0) {
      const lastRefreshed = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      
      const newCacheData: CacheData = {
        timestamp: now,
        lastRefreshed,
        mediaList: freshMediaList,
      };

      // Sync to in-memory first
      inMemoryCache = newCacheData;
      
      // Write cache to file synchronously
      try {
        fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(newCacheData, null, 2), 'utf-8');
      } catch (err) {
        console.error('Failed to write to AniList cache file:', err);
      }

      return {
        mediaList: freshMediaList,
        lastRefreshed,
        isFallback: false,
      };
    }
  } catch (error) {
    console.error(`Failed to fetch fresh seasonal data from AniList:`, error);
  }

  // 4. If fetch fails, fallback to stale cache if available
  if (cached && cached.mediaList.length > 0) {
    console.log('Serving stale cache as fallback...');
    return {
      mediaList: cached.mediaList,
      lastRefreshed: `${cached.lastRefreshed} (Stale Cache)`,
      isFallback: false,
    };
  }

  // 5. If everything fails, use static mock data
  const staticRefreshTime = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  return {
    mediaList: FALLBACK_ANIME_DATA,
    lastRefreshed: `${staticRefreshTime} (Default Offline Fallback)`,
    isFallback: true,
  };
}
