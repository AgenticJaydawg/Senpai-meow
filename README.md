# Senpai Meow 🐾 - Cozy Anime Airing Schedule

🔗 **Live site:** https://senpai-meow.vercel.app/

Welcome to **Senpai Meow 🐾**, a clean, ad-free, cozy anime schedule website. This app keeps track of all currently airing anime for the season, displaying them in a beautifully formatted schedule using local timezone detection and ticking countdown timers.

---

## 🌸 Key Features

- **🐾 Homepage Header**: Displays "Senpai Meow 🐾" with the subtitle *"No ads. No clutter. Just anime."* and a cat mascot logo.
- **✨ Today's Meows**: A horizontal scrolling carousel showcasing anime airing *today* in your local timezone, sorted by soonest release.
- **📅 Dynamic Grid & Calendar View**:
  - **Grid View**: A structured card display with responsive layouts.
  - **Calendar View**: A weekly 7-column schedule layout (Monday to Sunday) that collapses into an interactive day-by-day tabbed view on mobile.
- **⏱️ Live Ticking Countdowns**: Every anime card displays its exact next airing episode number, local release date/time, and a client-side ticking countdown updated every second.
- **🔍 Filters & Sorting**:
  - **Filters**: Quickly filter by *All*, *Today*, *Tomorrow*, or *This Week*.
  - **Search**: Search dynamically by title (English/Romaji/Native) or studio name.
  - **Sorting**: Sort by *Soonest Airing*, *Alphabetical*, or *Most Popular*.
- **📺 Interactive Detail Modal**: Click on any card to see description, genres, studio details, official AniList link, and an embedded YouTube trailer iframe (if available).
- **💾 24-Hour Server Cache**: Schedule data fetched from the **AniList GraphQL API** is cached for 24 hours to prevent rate limits and ensure fast page loads, with offline fallback static mock data if the API is down.
- **🎨 Cozy Aesthetics**: Built with a gorgeous soft cream and pink theme (`#FFFDFB` to `#FFECEF`), custom thin scrollbars, floating cat paw keyframe animations, loading skeleton states, and adorable error/empty screens.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router + TypeScript)
- **Styles**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Source**: [AniList GraphQL API](https://github.com/AniList/ApiV2-GraphQL-Docs)

---

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Build

To build the application for production:

```bash
npm run build
npm start
```

---

## 📁 Project Structure

- `src/lib/anilist.ts`: Connects to AniList GraphQL API, processes response data, filters formats (`TV`, `TV_SHORT`, `ONA`), handles local cache file (`anilist-cache.json`), and exports helper methods.
- `src/app/api/anime/route.ts`: API route handler serving processed schedule data.
- `src/components/`:
  - `CatPawBackground.tsx`: Decorative floating paw prints SVG.
  - `Header.tsx`: Title logo, view switcher, and refresh metadata.
  - `TodayMeows.tsx`: Cozy top horizontal scrolling carousel.
  - `FilterBar.tsx`: Responsive filtering tabs, title search input, and sorting selector.
  - `AnimeCard.tsx`: Client-side countdown ticking, cover images, and clean typography.
  - `CalendarView.tsx`: 7-column grid for desktop & mobile daily-tab switcher.
  - `AnimeModal.tsx`: Embedded YouTube trailer, genres, descriptions, and AniList site link.
- `src/app/globals.css`: Base design tokens, scrollbars, and customized Tailwind v4 keyframe animations.
- `src/app/page.tsx`: Parent page managing all dynamic state, loading skeletons, and interactive states.
