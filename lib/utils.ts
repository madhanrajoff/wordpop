/* Pure helpers: word logic + recall stats — no React, no Supabase */

import type { Word, WordWithStats } from './types';

/** Escape a string for safe use inside a RegExp. */
export const escapeRegex = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Case-insensitive word-boundary regex for a target word. */
export const wordRegex = (word: string) =>
  new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');

/** Does the target word appear in the sentence (whole-word, case-insensitive)? */
export const wordInSentence = (sentence: string, word: string) =>
  wordRegex(word).test(sentence);

/** Replace every occurrence of the target word with underscores of the same length. */
export const blankWord = (sentence: string, word: string) =>
  sentence.replace(wordRegex(word), (m) => '_'.repeat(m.length));

/** Aggregate attempts → per-word totals. */
export const computeStats = (
  attempts: { word_id: string; correct: boolean }[]
) => {
  const map = new Map<string, { total: number; correct: number }>();
  for (const a of attempts) {
    const s = map.get(a.word_id) ?? { total: 0, correct: 0 };
    s.total += 1;
    if (a.correct) s.correct += 1;
    map.set(a.word_id, s);
  }
  return map;
};

/** Attach stats to words and sort by weakest recall first. */
export const withStats = (
  words: Word[],
  attempts: { word_id: string; correct: boolean }[]
): WordWithStats[] => {
  const stats = computeStats(attempts);
  return words.map((w) => {
    const s = stats.get(w.id) ?? { total: 0, correct: 0 };
    return {
      ...w,
      total_attempts: s.total,
      correct_attempts: s.correct,
      recall_rate: s.total > 0 ? s.correct / s.total : 0,
    };
  });
};

/** Tailwind color class for a recall rate (0–1) — null when untested. */
export const recallColor = (rate: number | null) => {
  if (rate === null) return 'text-white/25';
  if (rate >= 0.7) return 'text-emerald-400';
  if (rate >= 0.4) return 'text-yellow-400';
  return 'text-accent';
};
