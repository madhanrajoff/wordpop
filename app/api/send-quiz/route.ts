import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getWebPush } from '@/lib/web-push';
import type { PushSubscriptionRow } from '@/lib/types';

export const runtime = 'nodejs';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MINUTE_MS = 60_000;

const isUnauthorized = (req: NextRequest) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') !== `Bearer ${secret}`;
};

export async function GET(req: NextRequest) {
  if (isUnauthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('*');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const now = new Date();
  const sinceDate = new Date(now.getTime() - SEVEN_DAYS_MS).toISOString();
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];

  await Promise.allSettled(
    (subs as PushSubscriptionRow[]).map(async (sub) => {
      const lastAt = sub.last_notified_at ? new Date(sub.last_notified_at) : new Date(0);
      if ((now.getTime() - lastAt.getTime()) / MINUTE_MS < sub.interval_minutes) {
        skipped++;
        return;
      }

      const { data: words } = await supabase
        .from('words')
        .select('id, word')
        .eq('user_id', sub.user_id)
        .gte('created_at', sinceDate);

      if (!words?.length) {
        skipped++;
        return;
      }

      const word = words[Math.floor(Math.random() * words.length)];
      const payload = JSON.stringify({
        title: 'WordPop — Quiz Time!',
        body: `Can you recall the word "${word.word}"?`,
        wordId: word.id,
        url: `/?quiz=${word.id}`,
      });

      try {
        await getWebPush().sendNotification(
          sub.subscription as Parameters<ReturnType<typeof getWebPush>['sendNotification']>[0],
          payload
        );
        await supabase
          .from('push_subscriptions')
          .update({ last_notified_at: now.toISOString() })
          .eq('id', sub.id);
        sent++;
      } catch (err) {
        const e = err as { statusCode?: number; message?: string; body?: string };
        failed++;
        errors.push(`status=${e.statusCode} ${e.body ?? e.message ?? String(err)}`);
        if (e.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    })
  );

  return NextResponse.json({ ok: true, sent, skipped, failed, total: subs.length, errors });
}
