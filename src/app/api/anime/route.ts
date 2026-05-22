import { NextResponse } from 'next/server';
import { getSeasonalAnime } from '@/lib/anilist';

export async function GET() {
  try {
    const data = await getSeasonalAnime();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Route Error in /api/anime:', error);
    return NextResponse.json(
      { 
        error: 'The cats knocked over the database.', 
        mediaList: [], 
        lastRefreshed: 'Unknown' 
      },
      { status: 500 }
    );
  }
}
