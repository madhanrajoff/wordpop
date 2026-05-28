'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isPushSupported, subscribeToPush, unsubscribeFromPush } from '@/lib/push';

const PRESETS = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
];

interface Props {
  initialInterval: number;
  initialNotifications: boolean;
}

export function SettingsClient({ initialInterval, initialNotifications }: Props) {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Settings</h1>
      <IntervalSetting initial={initialInterval} />
      <NotificationToggle initial={initialNotifications} />
    </div>
  );
}

/* ─── Interval picker ─────────────────────────────────────────────────────── */

function IntervalSetting({ initial }: { initial: number }) {
  const isPreset = PRESETS.some((p) => p.value === initial);
  const [interval, setInterval] = useState(isPreset ? initial : 0);
  const [custom, setCustom] = useState(isPreset ? '' : String(initial));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const supabase = createClient();

  const flash = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSave = async () => {
    const mins = interval || parseInt(custom) || 60;
    if (mins < 5 || mins > 1440) return flash('Interval must be 5–1440 minutes.', false);

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('push_subscriptions')
      .update({ interval_minutes: mins })
      .eq('user_id', user!.id)
      .select('id');
    setSaving(false);

    if (error) return flash('Failed to save.', false);
    if (!data || data.length === 0)
      return flash('Enable notifications first, then set frequency.', false);
    flash('Interval saved!', true);
  };

  return (
    <section className="card space-y-5">
      <h2 className="font-medium">Quiz Frequency</h2>

      <div className="space-y-3">
        {PRESETS.map((opt) => (
          <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="interval"
              checked={interval === opt.value}
              onChange={() => { setInterval(opt.value); setCustom(''); }}
              className="w-4 h-4 accent-accent"
            />
            <span className="text-white/80">{opt.label}</span>
          </label>
        ))}

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="interval"
            checked={interval === 0}
            onChange={() => setInterval(0)}
            className="w-4 h-4 accent-accent"
          />
          <span className="text-white/80">Custom:</span>
          <input
            type="number"
            min="5"
            max="1440"
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setInterval(0); }}
            placeholder="minutes"
            className="input w-28 py-1 text-sm"
          />
        </label>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary py-2 text-sm">
        {saving ? 'Saving…' : 'Save Frequency'}
      </button>

      {msg && (
        <p className={msg.ok ? 'alert-success' : 'alert-error inline-block'}>
          {msg.text}
        </p>
      )}
    </section>
  );
}

/* ─── Push notifications toggle ───────────────────────────────────────────── */

function NotificationToggle({ initial }: { initial: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const flash = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleToggle = async () => {
    if (!isPushSupported()) {
      return flash('Push notifications are not supported in this browser.', false);
    }
    setBusy(true);

    if (enabled) {
      await unsubscribeFromPush();
      setEnabled(false);
      flash('Notifications disabled.', true);
    } else {
      const ok = await subscribeToPush();
      if (ok) {
        setEnabled(true);
        flash('Notifications enabled!', true);
      } else {
        flash('Could not enable push — check browser permissions.', false);
      }
    }
    setBusy(false);
  };

  return (
    <section className="card">
      <h2 className="font-medium mb-4">Push Notifications</h2>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-white/80 text-sm">Quiz reminders</p>
          <p className="text-white/40 text-xs mt-0.5">
            Receive push notifications when it&apos;s time to quiz
          </p>
        </div>

        <button
          onClick={handleToggle}
          disabled={busy}
          role="switch"
          aria-checked={enabled}
          aria-label={enabled ? 'Disable notifications' : 'Enable notifications'}
          className={`inline-flex flex-shrink-0 h-6 w-11 items-center rounded-full border-2 border-transparent
                      transition-colors duration-200 disabled:opacity-50 cursor-pointer
                      ${enabled ? 'bg-accent' : 'bg-white/20'}`}
        >
          <span
            aria-hidden="true"
            className={`inline-block h-5 w-5 rounded-full bg-white shadow
                        transition-transform duration-200 ease-in-out
                        ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>

      {msg && (
        <p className={`mt-3 ${msg.ok ? 'alert-success' : 'alert-error inline-block'}`}>
          {msg.text}
        </p>
      )}
    </section>
  );
}
