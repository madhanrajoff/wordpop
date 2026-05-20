import { createClient } from '@/lib/supabase/server';
import { computeStats } from '@/lib/utils';
import { AddWordForm } from '@/components/AddWordForm';
import { WordCard } from '@/components/WordCard';
import { QuizModal } from '@/components/QuizModal';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ quiz?: string }>;
}) {
  const { quiz } = await searchParams;
  const supabase = await createClient();

  const [{ data: words }, { data: attempts }] = await Promise.all([
    supabase.from('words').select('*').order('created_at', { ascending: false }),
    supabase.from('attempts').select('word_id, correct'),
  ]);

  const stats = computeStats(attempts ?? []);
  const list = words ?? [];

  return (
    <>
      {quiz && <QuizModal wordId={quiz} />}

      <div className="space-y-5">
        <header>
          <h1 className="font-display text-3xl">Your Words</h1>
          <p className="text-white/45 text-sm mt-0.5">
            {list.length} word{list.length !== 1 ? 's' : ''} in your collection
          </p>
        </header>

        <AddWordForm />

        <div className="space-y-2.5">
          {list.map((word) => {
            const s = stats.get(word.id) ?? { total: 0, correct: 0 };
            return (
              <WordCard
                key={word.id}
                word={word}
                totalAttempts={s.total}
                correctAttempts={s.correct}
              />
            );
          })}

          {list.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <p className="text-4xl mb-3">📚</p>
              <p>No words yet — add your first word above!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
