import { createClient } from '@/lib/supabase/server';
import { withStats, recallColor } from '@/lib/utils';

export default async function HistoryPage() {
  const supabase = await createClient();

  const [{ data: words }, { data: attempts }] = await Promise.all([
    supabase.from('words').select('*'),
    supabase.from('attempts').select('word_id, correct'),
  ]);

  // Weakest first; ties broken alphabetically
  const list = withStats(words ?? [], attempts ?? []).sort(
    (a, b) => a.recall_rate - b.recall_rate || a.word.localeCompare(b.word)
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl">History</h1>
        <p className="text-white/45 text-sm mt-0.5">Sorted by weakest recall first</p>
      </header>

      <div className="space-y-2.5">
        {list.map((w) => {
          const rate = w.total_attempts > 0 ? w.recall_rate : null;
          const pct = rate !== null ? Math.round(rate * 100) : null;

          return (
            <article key={w.id} className="card-tight space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl leading-tight">{w.word}</h3>
                  <p className="text-white/55 text-sm mt-0.5 leading-snug">{w.definition}</p>
                </div>
                <div className="flex-shrink-0 text-right min-w-[4rem]">
                  {pct !== null ? (
                    <>
                      <p className={`text-2xl font-display font-bold leading-none ${recallColor(rate)}`}>
                        {pct}%
                      </p>
                      <p className="text-white/30 text-xs mt-0.5">
                        {w.correct_attempts}/{w.total_attempts}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-white/25 text-xl leading-none">—</p>
                      <p className="text-white/25 text-xs mt-0.5">untested</p>
                    </>
                  )}
                </div>
              </div>

              <p className="font-mono text-xs text-white/35 italic leading-snug border-t border-white/8 pt-2">
                {w.sentence}
              </p>
            </article>
          );
        })}

        {list.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <p className="text-4xl mb-3">📊</p>
            <p>No words yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
