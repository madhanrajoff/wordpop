'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { wordInSentence } from '@/lib/utils';

export function AddWordForm() {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [sentence, setSentence] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const reset = () => {
    setWord('');
    setDefinition('');
    setSentence('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedWord = word.trim();
    if (!wordInSentence(sentence.trim(), trimmedWord)) {
      setError(`The word "${trimmedWord}" must appear in the example sentence.`);
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from('words').insert({
      user_id: user!.id,
      word: trimmedWord,
      definition: definition.trim(),
      sentence: sentence.trim(),
    });
    setLoading(false);

    if (insertError) return setError(insertError.message);
    reset();
    setOpen(false);
    router.refresh();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border-2 border-dashed border-white/15 hover:border-accent/60
                   rounded-xl py-4 text-white/35 hover:text-accent transition-colors text-sm"
      >
        + Add New Word
      </button>
    );
  }

  return (
    <div className="card animate-fade-in">
      <h3 className="font-display text-xl mb-4">Add New Word</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="word">Word</label>
          <input
            id="word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            required
            autoFocus
            placeholder="e.g. ephemeral"
            className="input"
          />
        </div>

        <div>
          <label className="label" htmlFor="def">Definition</label>
          <textarea
            id="def"
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            required
            rows={2}
            placeholder="What does it mean?"
            className="input resize-none"
          />
        </div>

        <div>
          <label className="label" htmlFor="sentence">
            Example Sentence{' '}
            <span className="text-white/30">(must contain the word)</span>
          </label>
          <textarea
            id="sentence"
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            required
            rows={3}
            placeholder="Use the word naturally in a sentence…"
            className="input font-mono text-sm resize-none"
          />
        </div>

        {error && <p className="alert-error">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => { reset(); setOpen(false); }}
            className="btn-ghost flex-1 py-2.5"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5">
            {loading ? 'Adding…' : 'Add Word'}
          </button>
        </div>
      </form>
    </div>
  );
}
