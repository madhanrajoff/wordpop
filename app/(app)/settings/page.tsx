import { createClient } from '@/lib/supabase/server';
import { SettingsClient } from '@/components/SettingsClient';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sub } = user
    ? await supabase
        .from('push_subscriptions')
        .select('interval_minutes')
        .eq('user_id', user.id)
        .maybeSingle()
    : { data: null };

  return (
    <SettingsClient
      initialInterval={sub?.interval_minutes ?? 60}
      initialNotifications={!!sub}
    />
  );
}
