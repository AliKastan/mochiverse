// ============================================================
// Daily focus reminder — a local notification at the user's chosen time.
//
// Real scheduled-while-closed reminders need the native layer (Capacitor Local
// Notifications on iOS). This is the single seam: `applyReminder("19:30")` or
// `applyReminder(null)` to cancel. On plain web it can only request permission
// (browsers can't reliably fire a daily local notification while closed), so the
// meaningful implementation lands once the app is wrapped with Capacitor.
//
// TO GO LIVE (your part): `npm i @capacitor/local-notifications`, then replace
// the TODO(NOTIF) blocks with LocalNotifications.schedule({ ... every: 'day' }).
// ============================================================

const REMINDER_ID = 42; // stable id so re-scheduling replaces the old one

function hasNative(): boolean {
  return typeof (globalThis as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor?.isNativePlatform === 'function';
}

/** Schedule (or cancel, with null) the daily reminder at local "HH:MM". */
export async function applyReminder(hhmm: string | null): Promise<void> {
  if (hasNative()) {
    // TODO(NOTIF): with @capacitor/local-notifications —
    //   const { LocalNotifications } = await import('@capacitor/local-notifications');
    //   await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
    //   if (!hhmm) return;
    //   const [h, m] = hhmm.split(':').map(Number);
    //   await LocalNotifications.requestPermissions();
    //   await LocalNotifications.schedule({ notifications: [{
    //     id: REMINDER_ID, title: 'Mochi seni bekliyor 🐾',
    //     body: 'Bugünkü odak seansını yapmayı unutma!',
    //     schedule: { on: { hour: h, minute: m }, allowWhileIdle: true, every: 'day' } }] });
    void REMINDER_ID;
    return;
  }
  // Web fallback: at least secure permission so the wrapped app is ready. A true
  // daily background reminder isn't possible from a closed browser tab.
  if (hhmm && 'Notification' in window && Notification.permission === 'default') {
    try { await Notification.requestPermission(); } catch { /* ignore */ }
  }
}
