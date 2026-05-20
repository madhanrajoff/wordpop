import { Word } from '@/lib/types';
import { recallColor } from '@/lib/utils';

interface WordCardProps {
  word: Word;
  totalAttempts: number;
  correctAttempts: number;
}

export function WordCard({ word, totalAttempts, correctAttempts }: WordCardProps) {
  const rate = totalAttempts > 0 ? correctAttempts / totalAttempts : null;
  const pct = rate !== null ? Math.round(rate * 100) : null;

  return (
    <div className="card-tight">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl leading-tight">{word.word}</h3>
          <p className="text-white/55 text-sm mt-1 leading-snug line-clamp-2">
            {word.definition}
          </p>
        </div>

        <div className="flex-shrink-0 text-right min-w-[3.5rem]">
          {pct !== null ? (
            <>
              <p className={`text-xl font-display font-bold leading-none ${recallColor(rate)}`}>
                {pct}%
              </p>
              <p className="text-white/30 text-xs mt-0.5">recall</p>
            </>
          ) : (
            <>
              <p className="text-white/25 text-xl leading-none">—</p>
              <p className="text-white/25 text-xs mt-0.5">untested</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
