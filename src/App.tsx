import { useEffect } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { useGame } from './store/useGame';
import { useInterval } from './hooks';
import { sound } from './audio/sound';
import { ToastHost } from './components/toast';
import { MuteIcon } from './components/Icons';
import { activeLocale, dirFor, detectLocale } from './i18n';

import { Onboarding } from './screens/Onboarding';
import { Hatch } from './screens/Hatch';
import { Home } from './screens/Home';
import { Focus } from './screens/Focus';
import { SessionComplete } from './screens/SessionComplete';
import { DeathScene } from './screens/DeathScene';
import { Memorial } from './screens/Memorial';
import { Stats } from './screens/Stats';
import { Shop } from './screens/Shop';
import { Collection } from './screens/Collection';
import { Settings } from './screens/Settings';
import { Premium } from './screens/Premium';
import { Coins } from './screens/Coins';
import type { Screen } from './game/types';

const SCREENS: Record<Screen, React.ComponentType> = {
  onboarding: Onboarding,
  hatch: Hatch,
  home: Home,
  focus: Focus,
  complete: SessionComplete,
  death: DeathScene,
  memorial: Memorial,
  stats: Stats,
  shop: Shop,
  collection: Collection,
  settings: Settings,
  premium: Premium,
  coins: Coins,
};

export default function App() {
  const screen = useGame((s) => s.screen);
  const resume = useGame((s) => s.resume);
  const tick = useGame((s) => s.tick);
  const muted = useGame((s) => s.settings.muted);
  const toggleMute = useGame((s) => s.toggleMute);
  const locale = useGame((s) => s.settings.locale);
  const setLocale = useGame((s) => s.setLocale);

  const dir = dirFor(activeLocale(locale));

  // On load: rehydrated store already holds lastSeenAt — apply real-time decay.
  useEffect(() => {
    resume();
    sound.setMuted(useGame.getState().settings.muted);
    // first launch: persist the auto-detected device language
    if (useGame.getState().settings.locale === null) setLocale(detectLocale());
  }, [resume, setLocale]);

  // Live decay while the app is open (paused during focus inside tick()).
  useInterval(() => tick(), 15_000);

  // Re-apply decay whenever the tab returns to the foreground.
  useEffect(() => {
    const onVis = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [tick]);

  const ScreenComp = SCREENS[screen];
  // hide the mute chrome on immersive/celebratory screens
  const hideChrome = screen === 'onboarding';

  return (
    <MotionConfig reducedMotion="user">
    <div className="app-shell" dir={dir}>
      <AnimatePresence>
        <motion.div key={screen} style={{ position: 'absolute', inset: 0 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}>
          <ScreenComp />
        </motion.div>
      </AnimatePresence>

      {!hideChrome && (
        <button className="icon-btn" onClick={toggleMute} aria-label="Ses"
          style={{ position: 'absolute', top: 16, right: 16, zIndex: 80 }}>
          <MuteIcon muted={muted} />
        </button>
      )}

      <ToastHost />
    </div>
    </MotionConfig>
  );
}
