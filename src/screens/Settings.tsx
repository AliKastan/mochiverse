import { useGame } from '../store/useGame';
import { useT, LOCALES, activeLocale } from '../i18n';
import { SkyBackground } from '../components/backgrounds/SkyBackground';
import { ItemIcon } from '../components/ItemIcon';
import { MuteIcon } from '../components/Icons';
import { THEMES, SKINS } from '../game/premium';
import { FOCUS_SOUNDS } from '../audio/focusSound';
import { applyReminder } from '../notifications';

// A little lock badge shown on premium options the user hasn't unlocked.
function Lock() {
  return (
    <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%',
      background: '#c58b00', color: '#fff', fontSize: 10, display: 'grid', placeItems: 'center',
      border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>🔒</span>
  );
}

export function Settings() {
  const COPY = useT();
  const muted = useGame((s) => s.settings.muted);
  const toggleMute = useGame((s) => s.toggleMute);
  const localeSetting = useGame((s) => s.settings.locale);
  const setLocale = useGame((s) => s.setLocale);
  const theme = useGame((s) => s.settings.theme);
  const setTheme = useGame((s) => s.setTheme);
  const skin = useGame((s) => s.settings.skin);
  const setSkin = useGame((s) => s.setSkin);
  const focusSound = useGame((s) => s.settings.focusSound);
  const setFocusSound = useGame((s) => s.setFocusSound);
  const reminder = useGame((s) => s.settings.reminder);
  const setReminder = useGame((s) => s.setReminder);
  const premium = useGame((s) => s.premium);
  const go = useGame((s) => s.go);
  const current = activeLocale(localeSetting);

  const changeReminder = (v: string | null) => { setReminder(v); applyReminder(v); };

  // pick if unlocked, otherwise route to the paywall
  const pick = (locked: boolean, apply: () => void) => (locked ? go('premium') : apply());

  return (
    <div className="col" style={{ position: 'absolute', inset: 0 }}>
      <SkyBackground />
      <div className="col scroll-y" style={{ position: 'relative', flex: 1, minHeight: 0, padding: '16px 14px 24px', gap: 14 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="icon-btn" onClick={() => go('home')} aria-label={COPY.common.back}>
            <ItemIcon icon="back" size={22} />
          </button>
          <h2 style={{ color: 'var(--ink)', fontSize: 15 }}>{COPY.settings.title}</h2>
          <span style={{ width: 46 }} />
        </div>

        {/* THEME */}
        <div className="glass col" style={{ padding: 14, gap: 10 }}>
          <span style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--ink)' }}>{COPY.themes.title}</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {THEMES.map((t) => {
              const locked = t.premium && !premium;
              const active = theme === t.id;
              return (
                <button key={t.id} onClick={() => pick(locked, () => setTheme(t.id))}
                  className="col" style={{ position: 'relative', gap: 5, alignItems: 'center', padding: 6,
                    border: active ? '3px solid var(--ink)' : '3px solid transparent', borderRadius: 12,
                    background: 'transparent', cursor: 'pointer' }}>
                  <div style={{ width: '100%', height: 40, borderRadius: 8, background: t.swatch,
                    border: '2px solid rgba(106,83,117,0.3)', opacity: locked ? 0.75 : 1 }} />
                  {locked && <Lock />}
                  <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 11, color: 'var(--ink)' }}>
                    {COPY.themes[t.nameKey as keyof typeof COPY.themes] ?? t.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PET SKIN */}
        <div className="glass col" style={{ padding: 14, gap: 10 }}>
          <span style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--ink)' }}>{COPY.skins.title}</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {SKINS.map((sk) => {
              const locked = sk.premium && !premium;
              const active = skin === sk.id;
              return (
                <button key={sk.id} onClick={() => pick(locked, () => setSkin(sk.id))}
                  className="col" style={{ position: 'relative', gap: 4, alignItems: 'center', padding: 5,
                    border: active ? '3px solid var(--ink)' : '3px solid transparent', borderRadius: 12,
                    background: 'transparent', cursor: 'pointer' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: sk.swatch,
                    border: '2px solid rgba(106,83,117,0.3)', opacity: locked ? 0.75 : 1 }} />
                  {locked && <Lock />}
                  <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 10, color: 'var(--ink)' }}>
                    {COPY.skins[sk.nameKey as keyof typeof COPY.skins] ?? sk.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FOCUS SOUND */}
        <div className="glass col" style={{ padding: 14, gap: 10 }}>
          <span style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--ink)' }}>{COPY.sounds.title}</span>
          <div className="row" style={{ gap: 7, flexWrap: 'wrap' }}>
            {FOCUS_SOUNDS.map((snd) => {
              const locked = snd.premium && !premium;
              const on = focusSound === snd.id;
              return (
                <button key={snd.id} onClick={() => (locked ? go('premium') : setFocusSound(snd.id))}
                  className={`btn ${on ? 'btn-peach' : 'btn-ghost'}`} style={{ padding: '9px 12px', fontSize: '0.6rem' }}>
                  {locked ? '🔒 ' : ''}{COPY.sounds[snd.nameKey as keyof typeof COPY.sounds] ?? snd.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* DAILY REMINDER */}
        <div className="glass col" style={{ padding: 14, gap: 10 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--ink)' }}>{COPY.reminder.title}</span>
            <button className={`btn ${reminder ? 'btn-mint' : 'btn-ghost'}`} style={{ padding: '8px 14px', fontSize: '0.6rem' }}
              onClick={() => changeReminder(reminder ? null : '19:30')}>
              {reminder ? COPY.reminder.on : COPY.reminder.off}
            </button>
          </div>
          {reminder && (
            <input type="time" value={reminder} onChange={(e) => changeReminder(e.target.value || null)}
              style={{ padding: '10px 12px', borderRadius: 12, border: '2px solid var(--ink)', background: 'var(--cream)',
                color: 'var(--ink)', fontFamily: 'Fredoka', fontWeight: 700, fontSize: 15, width: '100%', boxSizing: 'border-box' }} />
          )}
        </div>

        {/* SOUND */}
        <div className="glass row" style={{ padding: 14, justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--ink)' }}>{COPY.settings.sound}</span>
          <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: '0.6rem', gap: 6 }} onClick={toggleMute}>
            <MuteIcon muted={muted} size={18} /> {muted ? COPY.settings.soundOff : COPY.settings.soundOn}
          </button>
        </div>

        {/* LANGUAGE */}
        <div className="glass col" style={{ padding: 14, gap: 10 }}>
          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <ItemIcon icon="flower" size={18} />
            <span style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--ink)' }}>{COPY.settings.language}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {LOCALES.map((l) => (
              <button key={l.id} className={`btn ${current === l.id ? 'btn-peach' : 'btn-ghost'}`}
                style={{ padding: '10px 8px', fontSize: '0.62rem', justifyContent: 'center' }}
                dir={l.dir} onClick={() => setLocale(l.id)}>
                {l.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
