import webpush from 'web-push';

/**
 * Return a configured web-push instance.
 * Called at request time — never at build time — so missing env vars
 * during the Vercel build don't crash the process.
 */
export function getWebPush() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  return webpush;
}
