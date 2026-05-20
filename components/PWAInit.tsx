'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isPushSupported, registerServiceWorker, subscribeToPush } from '@/lib/push';

/** Registers the SW, then — if logged in and not yet subscribed — opts the user into push. */
async function initPWA() {
  const reg = await registerServiceWorker();
  if (!reg || !isPushSupported() || Notification.permission === 'denied') return;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) return;
  await subscribeToPush();
}

export function PWAInit() {
  useEffect(() => {
    initPWA();
  }, []);
  return null;
}
