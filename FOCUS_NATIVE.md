# Focus features — what's in the app vs what needs native iOS

Mochiverse is a React/Vite web app wrapped for the App Store with **Capacitor**.
Some focus-app features are pure web (already built); the headline ones you asked
about (blocking other apps, a live lock-screen timer) are **native iOS only** —
they need Swift + Apple frameworks and, in one case, a special Apple entitlement.
They **cannot** be done in the web/JS code.

---

## ✅ Built in the web app (works now, ships with the wrap)

- **Keep screen awake during focus** — Screen Wake Lock API (`useWakeLock`), so the
  phone never dims mid-timer.
- **Leave-the-app anti-cheat** — Page Visibility API: switching away during a
  session too long fails it (already in `usePageVisibility` + `ANTICHEAT`).
- **Ambient focus sounds** — procedural white/pink/brown/rain noise via Web Audio
  (`audio/focusSound.ts`), no audio files. Extra sounds are Premium.
- **Weekly focus goal + progress ring**, per-subject tracking, streaks, heatmap.
- **Daily reminder — app-side** setting (Settings → Daily reminder) + a seam
  (`notifications.ts`). Real scheduling needs the native plugin below.

## 🔧 Native — YOU wire these (needs Mac + Xcode + Apple Developer account)

### 1. Block other apps (Instagram, etc.) — HARDEST, gated by Apple
- Framework: **Family Controls + ManagedSettings + DeviceActivity** (Screen Time API).
- Requires the **`com.apple.developer.family-controls` entitlement**, which Apple
  grants only by **special request** (you apply, justify the use case). Not
  guaranteed. No JS/Capacitor bridge exists — must be written in **Swift** as a
  native module + a DeviceActivity monitor extension.
- Flow: user picks apps to block (FamilyActivityPicker) → during a focus session
  your ManagedSettings shield hides/limits them → lift the shield when the timer ends.
- This is a multi-day native task; budget for it or launch v1 without it.

### 2. Live timer on the lock screen / Dynamic Island
- Framework: **ActivityKit (Live Activities) + WidgetKit**, written in **Swift**.
- Start a Live Activity when a focus session begins; update the countdown; end it
  on completion. Shows the running timer on the lock screen and Dynamic Island.
- Bridge it to the web timer via a small Capacitor plugin (start/update/end).

### 3. Home-screen / lock-screen widget (idle pet + today's focus)
- Framework: **WidgetKit** (Swift). Share data via an App Group so the widget can
  read the pet state + today's minutes the web app writes.

### 4. Real daily reminder notifications
- Plugin: **`@capacitor/local-notifications`**. Replace the `TODO(NOTIF)` block in
  `src/notifications.ts` with `LocalNotifications.schedule({ … every: 'day' })`.
  (App-side UI + seam already done.)

### 5. Background timer accuracy
- If the user locks the phone mid-session, iOS suspends the webview. Use a native
  timer / the Live Activity as source of truth, or compute elapsed from timestamps
  on resume (the app already resumes from `startedAt`). Also decide: locking the
  phone should NOT fail the anti-cheat (that's "putting the phone down" = good);
  only switching to another app should. Native app-state (`Capacitor App` plugin:
  `appStateChange` vs a real background) lets you tell these apart — web can't.

---

## Capacitor setup (prerequisite for all native work)
```
npm i @capacitor/core @capacitor/cli
npx cap init
npm run build && npx cap add ios && npx cap sync
npx cap open ios     # opens Xcode
```
Then add the Swift modules/extensions above and the plugins (RevenueCat for IAP —
see `src/billing.ts`, local-notifications, and your custom Live Activity plugin).
