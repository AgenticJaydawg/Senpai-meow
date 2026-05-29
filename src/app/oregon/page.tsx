'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import {
  Sun, Moon, ThumbsUp, ThumbsDown, Plus, X, Search,
  TrendingUp, TrendingDown, Award, ExternalLink, ChevronDown,
  BarChart3, Leaf, Scale, Landmark, HeartPulse, GraduationCap,
  ShieldCheck, Coins, Hammer, Users, CheckCircle2, XCircle,
  Sparkles, AlertTriangle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ChoiceType = 'good' | 'bad';
type Category =
  | 'Environment'
  | 'Economy'
  | 'Policy'
  | 'Infrastructure'
  | 'Social'
  | 'Law'
  | 'Health'
  | 'Education';

interface OregonChoice {
  id: string;
  title: string;
  description: string;
  type: ChoiceType;
  category: Category;
  date: string;
  impact: number; // 1–10
  votes: { up: number; down: number };
  source?: string;
  seeded: boolean;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED: OregonChoice[] = [
  // ── GOOD ──
  {
    id: 's1',
    title: "Oregon Bottle Bill (1971)",
    description:
      "The nation's first container deposit law. Charged deposits on beer and soda bottles, slashing roadside litter by 83% and launching a recycling revolution copied by a dozen states.",
    type: 'good',
    category: 'Environment',
    date: '1971-07-02',
    impact: 9,
    votes: { up: 611, down: 44 },
    source: 'https://en.wikipedia.org/wiki/Oregon_Bottle_Bill',
    seeded: true,
  },
  {
    id: 's2',
    title: "Death with Dignity Act (1997)",
    description:
      "Oregon became the first US state to legally authorize physician-assisted dying for terminally ill adults. After more than 25 years it remains a compassionate model studied worldwide.",
    type: 'good',
    category: 'Health',
    date: '1997-10-27',
    impact: 8,
    votes: { up: 524, down: 180 },
    source: 'https://www.oregon.gov/oha/PH/ProviderPartnerResources/EvaluationResearch/DeathwithDignityAct',
    seeded: true,
  },
  {
    id: 's3',
    title: "Vote by Mail (Statewide, 1998)",
    description:
      "Oregon pioneered all-mail elections, boosting turnout by ~10 points compared to national averages and making it the model for Washington, Colorado, and eventually much of the country.",
    type: 'good',
    category: 'Policy',
    date: '1998-01-20',
    impact: 9,
    votes: { up: 742, down: 95 },
    source: 'https://sos.oregon.gov/voting/pages/voteinoregon.aspx',
    seeded: true,
  },
  {
    id: 's4',
    title: "Senate Bill 762 — Wildfire Risk Reduction (2021)",
    description:
      "Nation-leading wildfire legislation requiring utilities to harden infrastructure, mandating risk assessments, and funding community resilience programs after the catastrophic 2020 fire season.",
    type: 'good',
    category: 'Environment',
    date: '2021-07-27',
    impact: 8,
    votes: { up: 398, down: 52 },
    seeded: true,
  },
  {
    id: 's5',
    title: "Statewide Land-Use Planning System (1973)",
    description:
      "Senate Bill 100 created urban growth boundaries around every city in Oregon, preserving 16 million acres of farmland and forest while containing sprawl. No other state has matched it.",
    type: 'good',
    category: 'Environment',
    date: '1973-07-02',
    impact: 10,
    votes: { up: 834, down: 67 },
    source: 'https://www.oregon.gov/lcd/pages/index.aspx',
    seeded: true,
  },
  {
    id: 's6',
    title: "Oregon Health Plan Medicaid Expansion (1994)",
    description:
      "Oregon's innovative prioritized Medicaid list covered the uninsured years before the ACA, becoming a national template for evidence-based benefit design.",
    type: 'good',
    category: 'Health',
    date: '1994-02-01',
    impact: 8,
    votes: { up: 477, down: 61 },
    seeded: true,
  },
  {
    id: 's7',
    title: "Clean Energy Jobs Bill — 100% Clean Electricity by 2040 (2021)",
    description:
      "HB 2021 set one of the most aggressive clean-electricity targets in the US, requiring utilities to eliminate coal and move to 100% clean power sources by 2040.",
    type: 'good',
    category: 'Environment',
    date: '2021-07-27',
    impact: 9,
    votes: { up: 603, down: 77 },
    seeded: true,
  },
  {
    id: 's8',
    title: "Hate Crime Protections Strengthened (2019)",
    description:
      "SB 577 expanded Oregon's hate-crime statute to explicitly cover religion, sexual orientation, gender identity, and disability, one of the broadest in the West.",
    type: 'good',
    category: 'Law',
    date: '2019-08-08',
    impact: 7,
    votes: { up: 381, down: 88 },
    seeded: true,
  },
  {
    id: 's9',
    title: "Free Community College Tuition for Oregon Graduates (Oregon Promise, 2015)",
    description:
      "Oregon launched the Oregon Promise grant, covering nearly all community-college tuition for recent high school graduates regardless of family income.",
    type: 'good',
    category: 'Education',
    date: '2015-07-01',
    impact: 7,
    votes: { up: 512, down: 48 },
    seeded: true,
  },
  // ── BAD ──
  {
    id: 's10',
    title: "Measure 110 Drug Decrim — Then Repeal (2020–2024)",
    description:
      "Oregon voters decriminalized personal possession of hard drugs in 2020, but the absence of funded treatment infrastructure led to open drug use crises in Portland. The legislature reversed course in 2024, a rare full policy reversal.",
    type: 'bad',
    category: 'Policy',
    date: '2020-11-03',
    impact: 8,
    votes: { up: 614, down: 311 },
    source: 'https://www.oregon.gov/oha/HSD/AMH/pages/measure110.aspx',
    seeded: true,
  },
  {
    id: 's11',
    title: "PERS Pension Liability — $30B Unfunded Gap",
    description:
      "Decades of under-funding and overly generous benefit formulas left Oregon's Public Employee Retirement System with a $30 billion unfunded liability, crowding out K-12 spending.",
    type: 'bad',
    category: 'Economy',
    date: '2019-01-01',
    impact: 9,
    votes: { up: 701, down: 140 },
    seeded: true,
  },
  {
    id: 's12',
    title: "Portland's Ghost Bike Lane Network — $58M for Disconnected Strips",
    description:
      "Portland spent tens of millions installing protected bike lanes that end abruptly, run between parked cars, or connect nowhere, cited by national urban planners as a lesson in how not to build cycling infrastructure.",
    type: 'bad',
    category: 'Infrastructure',
    date: '2018-06-01',
    impact: 6,
    votes: { up: 489, down: 92 },
    seeded: true,
  },
  {
    id: 's13',
    title: "Columbia River Crossing Bridge Project Killed After $180M Spent (2013)",
    description:
      "Oregon and Washington spent $180 million planning a new Interstate Bridge replacing the 100-year-old Columbia River crossing. Washington's senate killed it over light-rail objections; no bridge was built.",
    type: 'bad',
    category: 'Infrastructure',
    date: '2013-06-03',
    impact: 8,
    votes: { up: 765, down: 88 },
    seeded: true,
  },
  {
    id: 's14',
    title: "Oregon DMV Driver's License Backlog — 2-Year Wait",
    description:
      "A botched IT modernization project in 2022–2023 left Oregonians waiting up to two years for driver's license appointments, forcing audits, legislative hearings, and a full system overhaul.",
    type: 'bad',
    category: 'Policy',
    date: '2022-09-01',
    impact: 7,
    votes: { up: 822, down: 44 },
    seeded: true,
  },
  {
    id: 's15',
    title: "Oregon Education Rankings — Consistently Bottom 10 in Graduation Rates",
    description:
      "Despite high per-pupil spending, Oregon's high school graduation rate ranks among the lowest nationally. Chronic absenteeism and under-resourced rural districts persist despite decades of reform attempts.",
    type: 'bad',
    category: 'Education',
    date: '2023-01-01',
    impact: 9,
    votes: { up: 703, down: 77 },
    seeded: true,
  },
  {
    id: 's16',
    title: "Elliott State Forest Sale Attempt — Public Land Nearly Lost",
    description:
      "In 2016, the State Land Board voted to sell the 82,500-acre Elliott State Forest—Oregon's only old-growth state forest—to a private timber company to plug pension deficits. Public outrage reversed the decision.",
    type: 'bad',
    category: 'Environment',
    date: '2016-02-02',
    impact: 8,
    votes: { up: 688, down: 55 },
    seeded: true,
  },
  {
    id: 's17',
    title: "Ransomware Attack on State Agencies — $30M Lost (2023)",
    description:
      "A supply-chain ransomware attack crippled Oregon's Department of Transportation and Housing Authority, leaking 3.5 million residents' personal data and costing an estimated $30M in response costs.",
    type: 'bad',
    category: 'Policy',
    date: '2023-05-31',
    impact: 7,
    votes: { up: 514, down: 33 },
    seeded: true,
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  'Environment', 'Economy', 'Policy', 'Infrastructure',
  'Social', 'Law', 'Health', 'Education',
];

const CATEGORY_META: Record<Category, { icon: React.ReactNode; color: string; bg: string; darkBg: string }> = {
  Environment: { icon: <Leaf size={12} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 border-emerald-200', darkBg: 'dark:bg-emerald-950/40 dark:border-emerald-800' },
  Economy:     { icon: <Coins size={12} />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 border-amber-200', darkBg: 'dark:bg-amber-950/40 dark:border-amber-800' },
  Policy:      { icon: <Landmark size={12} />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 border-blue-200', darkBg: 'dark:bg-blue-950/40 dark:border-blue-800' },
  Infrastructure: { icon: <Hammer size={12} />, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 border-orange-200', darkBg: 'dark:bg-orange-950/40 dark:border-orange-800' },
  Social:      { icon: <Users size={12} />, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 border-violet-200', darkBg: 'dark:bg-violet-950/40 dark:border-violet-800' },
  Law:         { icon: <Scale size={12} />, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 border-slate-200', darkBg: 'dark:bg-slate-800/60 dark:border-slate-600' },
  Health:      { icon: <HeartPulse size={12} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 border-rose-200', darkBg: 'dark:bg-rose-950/40 dark:border-rose-800' },
  Education:   { icon: <GraduationCap size={12} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 border-indigo-200', darkBg: 'dark:bg-indigo-950/40 dark:border-indigo-800' },
};

const STORAGE_KEY = 'oregon-choices-v1';
const VOTES_KEY   = 'oregon-votes-v1';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadChoices(): OregonChoice[] {
  if (typeof window === 'undefined') return SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed: OregonChoice[] = JSON.parse(raw);
    // Merge: keep seeded data current, append user additions
    const userAdded = parsed.filter((c) => !c.seeded);
    const merged = SEED.map((s) => {
      const stored = parsed.find((p) => p.id === s.id);
      return stored ? { ...s, votes: stored.votes } : s;
    });
    return [...merged, ...userAdded];
  } catch {
    return SEED;
  }
}

function saveChoices(choices: OregonChoice[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(choices));
}

function loadUserVotes(): Record<string, 'up' | 'down'> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUserVotes(votes: Record<string, 'up' | 'down'>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

function impactLabel(n: number) {
  if (n >= 9) return 'Critical';
  if (n >= 7) return 'High';
  if (n >= 5) return 'Medium';
  return 'Low';
}

function impactColor(n: number) {
  if (n >= 9) return 'text-red-500 dark:text-red-400';
  if (n >= 7) return 'text-orange-500 dark:text-orange-400';
  if (n >= 5) return 'text-amber-500 dark:text-amber-400';
  return 'text-green-500 dark:text-green-400';
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function scoreGrade(net: number): { grade: string; label: string; color: string } {
  if (net >= 40)  return { grade: 'A+', label: 'Outstanding',     color: 'text-emerald-500' };
  if (net >= 25)  return { grade: 'A',  label: 'Excellent',        color: 'text-emerald-500' };
  if (net >= 10)  return { grade: 'B',  label: 'Good',             color: 'text-green-500'   };
  if (net >= 0)   return { grade: 'C',  label: 'Passing',          color: 'text-amber-500'   };
  if (net >= -15) return { grade: 'D',  label: 'Needs Work',       color: 'text-orange-500'  };
  return              { grade: 'F',  label: 'Not Good, Oregon',  color: 'text-red-500'     };
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1000) {
  const [val, setVal] = useState(0);
  const frameRef = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);
  return val;
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: Category }) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.color} ${meta.bg} ${meta.darkBg}`}
    >
      {meta.icon} {category}
    </span>
  );
}

function ImpactDots({ impact }: { impact: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            i < impact ? 'bg-current' : 'bg-current opacity-15'
          }`}
        />
      ))}
    </div>
  );
}

interface ChoiceCardProps {
  choice: OregonChoice;
  userVote: 'up' | 'down' | undefined;
  onVote: (id: string, dir: 'up' | 'down') => void;
}

function ChoiceCard({ choice, userVote, onVote }: ChoiceCardProps) {
  const isGood = choice.type === 'good';
  const netVotes = choice.votes.up - choice.votes.down;

  return (
    <div
      className={`
        group relative flex flex-col rounded-3xl border overflow-hidden
        transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
        ${isGood
          ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/60'
          : 'bg-rose-50/60 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/60'
        }
      `}
    >
      {/* Type stripe */}
      <div className={`h-1 w-full ${isGood ? 'bg-emerald-500' : 'bg-rose-500'}`} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <CategoryBadge category={choice.category} />
              <span className={`text-[10px] font-bold uppercase tracking-wide ${impactColor(choice.impact)}`}>
                {impactLabel(choice.impact)} Impact
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-[var(--foreground)] leading-tight tracking-tight">
              {choice.title}
            </h3>
          </div>
          {/* Good/Bad badge */}
          <div
            className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
              isGood
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
            }`}
          >
            {isGood ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
            {isGood ? 'Good' : 'Bad'}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[var(--muted)] leading-relaxed flex-1">{choice.description}</p>

        {/* Impact dots */}
        <div className={`flex items-center gap-2 ${isGood ? 'text-emerald-500' : 'text-rose-500'}`}>
          <span className="text-[10px] font-bold text-[var(--muted)]">Impact</span>
          <ImpactDots impact={choice.impact} />
          <span className="text-[10px] font-black">{choice.impact}/10</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-current/10 gap-2">
          <div className="flex items-center gap-3">
            {/* Date */}
            <span className="text-[10px] font-semibold text-[var(--muted)]">{formatDate(choice.date)}</span>
            {/* Source */}
            {choice.source && (
              <a
                href={choice.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] flex items-center gap-0.5 transition-colors"
              >
                Source <ExternalLink size={9} />
              </a>
            )}
          </div>

          {/* Vote buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onVote(choice.id, 'up')}
              title="Agree"
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-black transition-all active:scale-95
                ${userVote === 'up'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:border-emerald-400 hover:text-emerald-500'
                }`}
            >
              <ThumbsUp size={10} /> {choice.votes.up}
            </button>
            <button
              onClick={() => onVote(choice.id, 'down')}
              title="Disagree"
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-black transition-all active:scale-95
                ${userVote === 'down'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:border-rose-400 hover:text-rose-500'
                }`}
            >
              <ThumbsDown size={10} /> {choice.votes.down}
            </button>
            <span
              className={`text-[10px] font-black px-1.5 ${
                netVotes > 0 ? 'text-emerald-500' : netVotes < 0 ? 'text-rose-500' : 'text-[var(--muted)]'
              }`}
            >
              {netVotes > 0 ? '+' : ''}{netVotes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Add Choice Modal ─────────────────────────────────────────────────────────

interface AddModalProps {
  onClose: () => void;
  onAdd: (c: OregonChoice) => void;
}

function AddModal({ onClose, onAdd }: AddModalProps) {
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [type, setType]         = useState<ChoiceType>('good');
  const [category, setCategory] = useState<Category>('Policy');
  const [date, setDate]         = useState(new Date().toISOString().slice(0, 10));
  const [impact, setImpact]     = useState(5);
  const [source, setSource]     = useState('');
  const [error, setError]       = useState('');

  const submit = () => {
    if (!title.trim() || !desc.trim()) {
      setError('Title and description are required.');
      return;
    }
    const choice: OregonChoice = {
      id: `user-${Date.now()}`,
      title: title.trim(),
      description: desc.trim(),
      type,
      category,
      date,
      impact,
      votes: { up: 0, down: 0 },
      source: source.trim() || undefined,
      seeded: false,
    };
    onAdd(choice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-6 shadow-2xl z-10 animate-modal-enter max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--accent)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <X size={16} />
        </button>

        <h2 className="text-lg font-black text-[var(--foreground)] mb-1 flex items-center gap-2">
          <Sparkles size={18} className="text-[var(--primary)]" />
          Log an Oregon Choice
        </h2>
        <p className="text-xs text-[var(--muted)] mb-5">
          Record a policy decision, law, or notable choice Oregon made.
        </p>

        {error && (
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-2 mb-4">
            <AlertTriangle size={12} /> {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Type toggle */}
          <div>
            <label className="block text-xs font-bold text-[var(--muted)] mb-1.5">Choice Type</label>
            <div className="flex gap-2">
              {(['good', 'bad'] as ChoiceType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-black border transition-all ${
                    type === t
                      ? t === 'good'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-rose-500 text-white border-rose-500'
                      : 'bg-[var(--accent)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]'
                  }`}
                >
                  {t === 'good' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {t === 'good' ? 'Good Choice' : 'Bad Choice'}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[var(--muted)] mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Oregon Bottle Bill (1971)"
              className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-2xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/60 outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[var(--muted)] mb-1.5">Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe what happened and why it matters..."
              rows={3}
              className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-2xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/60 outline-none focus:border-[var(--primary)] transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1.5">Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full appearance-none bg-[var(--accent)] border border-[var(--border)] rounded-2xl px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-2xl px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
          </div>

          {/* Impact Slider */}
          <div>
            <label className="block text-xs font-bold text-[var(--muted)] mb-1.5">
              Impact Score: <span className={`${impactColor(impact)} font-black`}>{impact}/10 — {impactLabel(impact)}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={impact}
              onChange={(e) => setImpact(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--muted)] mt-0.5">
              <span>Low</span><span>Medium</span><span>High</span><span>Critical</span>
            </div>
          </div>

          {/* Source */}
          <div>
            <label className="block text-xs font-bold text-[var(--muted)] mb-1.5">Source URL (optional)</label>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-2xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/60 outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
        </div>

        <button
          onClick={submit}
          className="mt-6 w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-black py-3 rounded-2xl shadow-md transition-all active:scale-[0.98]"
        >
          Add Choice 🌲
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OregonPage() {
  const { theme, toggleTheme, mounted } = useTheme();
  const [choices, setChoices]           = useState<OregonChoice[]>([]);
  const [userVotes, setUserVotes]       = useState<Record<string, 'up' | 'down'>>({});
  const [hydrated, setHydrated]         = useState(false);

  // Filters
  const [typeFilter, setTypeFilter]         = useState<'all' | 'good' | 'bad'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [sortBy, setSortBy]                 = useState<'date' | 'impact' | 'votes' | 'net'>('impact');
  const [search, setSearch]                 = useState('');
  const [showAdd, setShowAdd]               = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    setChoices(loadChoices());
    setUserVotes(loadUserVotes());
    setHydrated(true);
  }, []);

  const addChoice = useCallback((c: OregonChoice) => {
    setChoices((prev) => {
      const next = [c, ...prev];
      saveChoices(next);
      return next;
    });
  }, []);

  const handleVote = useCallback((id: string, dir: 'up' | 'down') => {
    setUserVotes((prevVotes) => {
      const current = prevVotes[id];
      const nextVotes = { ...prevVotes };

      setChoices((prevChoices) => {
        const next = prevChoices.map((c) => {
          if (c.id !== id) return c;
          const v = { ...c.votes };
          if (current === dir) {
            // toggle off
            v[dir] = Math.max(0, v[dir] - 1);
            delete nextVotes[id];
          } else {
            if (current) v[current] = Math.max(0, v[current] - 1);
            v[dir] += 1;
            nextVotes[id] = dir;
          }
          return { ...c, votes: v };
        });
        saveChoices(next);
        return next;
      });

      saveUserVotes(nextVotes);
      return nextVotes;
    });
  }, []);

  // Stats
  const goodChoices = choices.filter((c) => c.type === 'good');
  const badChoices  = choices.filter((c) => c.type === 'bad');
  const goodScore   = goodChoices.reduce((s, c) => s + c.impact, 0);
  const badScore    = badChoices.reduce((s, c) => s + c.impact, 0);
  const netScore    = goodScore - badScore;
  const grade       = scoreGrade(netScore);

  const goodCountAnim = useCountUp(hydrated ? goodChoices.length : 0, 900);
  const badCountAnim  = useCountUp(hydrated ? badChoices.length : 0, 900);
  const netScoreAnim  = useCountUp(hydrated ? Math.abs(netScore) : 0, 1100);

  // Filter + sort
  const filtered = choices
    .filter((c) => {
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date')   return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'impact') return b.impact - a.impact;
      if (sortBy === 'votes')  return (b.votes.up + b.votes.down) - (a.votes.up + a.votes.down);
      if (sortBy === 'net')    return (b.votes.up - b.votes.down) - (a.votes.up - a.votes.down);
      return 0;
    });

  // Category breakdown
  const categoryBreakdown = CATEGORIES.map((cat) => {
    const items = choices.filter((c) => c.category === cat);
    const good  = items.filter((c) => c.type === 'good').length;
    const bad   = items.filter((c) => c.type === 'bad').length;
    return { cat, good, bad, total: items.length };
  }).filter((r) => r.total > 0);

  const maxCatTotal = Math.max(...categoryBreakdown.map((r) => r.total), 1);

  return (
    <main className="min-h-screen bg-[var(--background)] relative pb-16">

      {/* ── Hero Header ────────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#00386b] via-[#004f9e] to-[#005a30] text-white">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}
        />

        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Left: Title block */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-3xl shadow-lg">
                  🌲
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60">State Accountability</p>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none">
                    Oregon Choices
                  </h1>
                  <p className="text-xs font-semibold text-white/70 mt-0.5">
                    Tracking the good, the bad, and the Oregonian since 1859.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-3 md:self-start md:mt-1">
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 px-4 py-2.5 rounded-2xl text-sm font-black transition-all active:scale-95 backdrop-blur-sm"
              >
                <Plus size={15} /> Add Choice
              </button>
              <a
                href="/"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all backdrop-blur-sm"
              >
                🐾 Senpai Meow
              </a>
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all backdrop-blur-sm"
                title="Toggle theme"
              >
                {mounted && theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>

          {/* ── Score Dashboard ── */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Good count */}
            <div className="bg-white/10 border border-white/15 rounded-3xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-emerald-300" />
                <span className="text-xs font-bold text-white/70 uppercase tracking-wide">Good Choices</span>
              </div>
              <div className="text-4xl font-black text-emerald-300 leading-none">{goodCountAnim}</div>
              <div className="text-xs text-white/50 mt-1 font-semibold">Impact: {goodScore} pts</div>
            </div>

            {/* Bad count */}
            <div className="bg-white/10 border border-white/15 rounded-3xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown size={16} className="text-rose-300" />
                <span className="text-xs font-bold text-white/70 uppercase tracking-wide">Bad Choices</span>
              </div>
              <div className="text-4xl font-black text-rose-300 leading-none">{badCountAnim}</div>
              <div className="text-xs text-white/50 mt-1 font-semibold">Impact: {badScore} pts</div>
            </div>

            {/* Net score */}
            <div className="bg-white/10 border border-white/15 rounded-3xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={16} className="text-amber-300" />
                <span className="text-xs font-bold text-white/70 uppercase tracking-wide">Net Score</span>
              </div>
              <div className={`text-4xl font-black leading-none ${netScore >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {netScore >= 0 ? '+' : '-'}{netScoreAnim}
              </div>
              <div className="text-xs text-white/50 mt-1 font-semibold">Good − Bad impact</div>
            </div>

            {/* Grade */}
            <div className="bg-white/10 border border-white/15 rounded-3xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Award size={16} className="text-purple-300" />
                <span className="text-xs font-bold text-white/70 uppercase tracking-wide">Grade</span>
              </div>
              <div className={`text-4xl font-black leading-none ${grade.color.replace('text-', 'text-')}`}>
                {grade.grade}
              </div>
              <div className="text-xs text-white/50 mt-1 font-semibold">{grade.label}</div>
            </div>
          </div>

          {/* Good/Bad ratio bar */}
          <div className="mt-5">
            <div className="flex justify-between text-[10px] font-bold text-white/60 mb-1.5">
              <span>Good {goodChoices.length}</span>
              <span>Accountability Bar</span>
              <span>Bad {badChoices.length}</span>
            </div>
            <div className="relative h-3 rounded-full bg-white/10 overflow-hidden border border-white/10">
              <div
                className="absolute left-0 top-0 h-full bg-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: choices.length > 0 ? `${(goodChoices.length / choices.length) * 100}%` : '50%' }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── Category Breakdown ─────────────────────────────────────── */}
      {categoryBreakdown.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mt-8">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-[var(--primary)]" />
              <h2 className="text-sm font-black text-[var(--foreground)]">Category Breakdown</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categoryBreakdown.map(({ cat, good, bad, total }) => {
                const meta = CATEGORY_META[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
                    className={`flex flex-col gap-2 p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      categoryFilter === cat
                        ? `${meta.bg} ${meta.darkBg} border-current`
                        : 'bg-[var(--accent)] border-[var(--border)] hover:border-[var(--primary)]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CategoryBadge category={cat} />
                      <span className="text-xs font-black text-[var(--muted)]">{total}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(good / total) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-emerald-500">{good}G</span>
                      <span className="text-rose-500">{bad}B</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Filter / Search Bar ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 mt-6 sticky top-3 z-20">
        <div className="bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--border)] rounded-3xl p-3 shadow-md">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search choices..."
                className="w-full pl-8 pr-4 py-2 bg-[var(--accent)] border border-[var(--border)] rounded-2xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/60 outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            {/* Type filter */}
            <div className="flex bg-[var(--accent)] p-1 rounded-2xl border border-[var(--border)] gap-0.5">
              {(['all', 'good', 'bad'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    typeFilter === t
                      ? t === 'good'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : t === 'bad'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-[var(--primary)] text-white shadow-sm'
                      : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'good' ? '✓ Good' : '✗ Bad'}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none bg-[var(--accent)] border border-[var(--border)] rounded-2xl pl-3 pr-7 py-2 text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)] cursor-pointer transition-colors"
              >
                <option value="impact">Sort: Impact</option>
                <option value="date">Sort: Date</option>
                <option value="votes">Sort: Most Voted</option>
                <option value="net">Sort: Net Votes</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
            </div>

            {/* Result count */}
            <span className="text-xs font-bold text-[var(--muted)] ml-auto">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </section>

      {/* ── Cards Grid ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 mt-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🌲</div>
            <p className="text-sm font-bold text-[var(--muted)]">No choices found. Try a different filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => (
              <ChoiceCard
                key={c.id}
                choice={c}
                userVote={userVotes[c.id]}
                onVote={handleVote}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="max-w-6xl mx-auto px-4 mt-16 pt-6 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-bold text-[var(--muted)]">
        <p>🌲 Oregon Choices Tracker — Built on <a href="/" className="hover:text-[var(--primary)] transition-colors">Senpai Meow</a> infrastructure.</p>
        <p>Data sourced from public records. Votes stored locally in your browser.</p>
      </footer>

      {/* ── Add Modal ──────────────────────────────────────────────── */}
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={addChoice} />}
    </main>
  );
}
