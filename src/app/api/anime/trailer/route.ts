import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'trailer-cache.json');

// In-memory cache fallback for serverless deployments
let inMemoryTrailerCache: Record<string, string> | null = null;

// Helper to read cache safely
function readCache(): Record<string, string> {
  if (inMemoryTrailerCache) {
    return inMemoryTrailerCache;
  }
  try {
    if (fs.existsSync(CACHE_FILE)) {
      inMemoryTrailerCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      return inMemoryTrailerCache!;
    }
  } catch (e) {
    console.error('Error reading trailer cache', e);
  }
  return {};
}

// Helper to write cache safely
function writeCache(cache: Record<string, string>) {
  inMemoryTrailerCache = cache;
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing trailer cache', e);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const cache = readCache();
    if (cache[title]) {
      return NextResponse.json({ trailerId: cache[title] });
    }

    // Scrape YouTube for the Crunchyroll trailer
    const query = encodeURIComponent(`Crunchyroll ${title} Official Trailer`);
    const url = `https://www.youtube.com/results?search_query=${query}`;
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!res.ok) {
      throw new Error(`YouTube results page responded with status ${res.status}`);
    }

    const html = await res.text();
    const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    
    if (match && match[1]) {
      const trailerId = match[1];
      cache[title] = trailerId;
      writeCache(cache);
      return NextResponse.json({ trailerId });
    }

    return NextResponse.json({ trailerId: null });
  } catch (err: any) {
    console.error('Error in trailer API endpoint:', err);
    return NextResponse.json({ trailerId: null, error: err.message }, { status: 500 });
  }
}
