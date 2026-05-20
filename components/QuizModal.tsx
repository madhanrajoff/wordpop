'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { blankWord } from '@/lib/utils';
import { Word } from '@/lib/types';

const MAX_ATTEMPTS = 3;
type Phase = 'loading' | 'quiz' | 'success' | 'failed';

export function QuizModal({ wordId }: { wordId: string }) {
  const [word, setWord] = useState<Word | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [answer, setAnswer] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from('words')
      .select('*')
      .eq('id', wordId)
      .single()
      .then(({ data }) => {
        if (data) {
          setWord(data);
          setPhase('quiz');
        } else {
          // Word not found — just dismiss
          router.replace('/');
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordId]);

  useEffect(() => {
    if (phase === 'quiz') setTimeout(() => inputRef.current?.focus(), 50);
  }, [phase]);

  const logAttempt = useCallback(
    async (correct: boolean) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !word) return;
      await supabase.from('attempts').insert({
        word_id: word.id,
        user_id: user.id,
        correct,
      });
    },
    [word, supabase]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!word || phase !== 'quiz') return;

      const isCorrect = answer.trim().toLowerCase() === word.word.toLowerCase();
      const next = attemptCount + 1;
      await logAttempt(isCorrect);

      if (isCorrect) {
        setPhase('success');
        setTimeout(() => router.replace('/'), 2000);
        return;
      }
      if (next >= MAX_ATTEMPTS) {
        setAttemptCount(next);
        setPhase('failed');
        setTimeout(() => router.replace('/'), 3500);
        return;
      }
      setAttemptCount(next);
      setAnswer('');
      setShake(true);
      setTimeout(() => {
        setShake(false);
        inputRef.current?.focus();
      }, 450);
    },
    [word, phase, answer, attemptCount, logAttempt, router]
  );

  const remaining = MAX_ATTEMPTS - attemptCount;

  return (
    <div className="fixed inset-0 z-50 bg-navy flex flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-lg flex flex-col gap-7 animate-fade-in">
        <header className="text-center">
          <span className="font-mono text-accent text-xs tracking-[0.2em] uppercase font-medium">
            Quiz Time
          </span>
          <h2 className="font-display text-3xl mt-1">Fill in the blank</h2>
        </header>

        {phase === 'loading' && (
          <div className="text-center text-white/30 font-mono animate-pulse py-12">
            Loading…
          </div>
        )}

        {word && phase !== 'loading' && (
          <>
            <div className="card">
              <p className="font-mono text-xl leading-relaxed text-center tracking-wide">
                {blankWord(word.sentence, word.word)}
              </p>
            </div>

            <div
              className="flex justify-center gap-2.5"
              aria-label={`${remaining} attempts remaining`}
            >
              {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < attemptCount ? 'bg-accent' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            {phase === 'quiz' && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type the missing word…"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className={`input-lg input-mono ${shake ? 'border-accent animate-shake' : ''}`}
                />
                <button
                  type="submit"
                  disabled={!answer.trim()}
                  className="btn-primary w-full text-lg py-3.5"
                >
                  Submit
                </button>
                <p className="text-center text-white/35 text-sm font-mono">
                  {remaining} attempt{remaining !== 1 ? 's' : ''} remaining
                </p>
              </form>
            )}

            {phase === 'success' && (
              <div className="text-center space-y-3 py-4">
                <div className="text-6xl">🎉</div>
                <p className="text-emerald-400 font-display text-3xl">Correct!</p>
                <p className="text-white/50">Nice recall — closing shortly…</p>
              </div>
            )}

            {phase === 'failed' && (
              <div className="text-center space-y-3 py-2">
                <p className="text-white/50">The answer was:</p>
                <p className="font-mono text-4xl font-bold">{word.word}</p>
                <p className="text-white/55 text-sm leading-snug max-w-xs mx-auto">
                  {word.definition}
                </p>
                <p className="text-white/30 text-xs font-mono mt-2">Closing shortly…</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
