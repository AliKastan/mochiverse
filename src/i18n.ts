import { useGame } from './store/useGame';
import type { LocaleId } from './game/types';
import { COPY as TR } from './game/copy';

// ============================================================
// Lightweight i18n. English is the complete base dictionary;
// every other locale is a (possibly partial) override that is
// deep-merged over English, so any untranslated string falls
// back to English automatically. Turkish is the original copy.
// ============================================================

const EN = {
  appName: 'Mochiverse',
  onboarding: [
    { emoji: '', title: 'A tiny friend awaits you', body: 'A Mochi will hatch from your egg. Give it a name, care for it, and grow together.' },
    { emoji: '', title: 'It grows as you focus', body: 'Every focus session feeds your Mochi, makes it happy and helps it evolve. While you work, it sleeps peacefully.' },
    { emoji: '', title: 'Neglect it… and lose it forever', body: 'If it stays hungry and unhappy it gets sick. If its health runs out, it never comes back. No revive, no undo. Really.' },
  ],
  hatch: { tapEgg: 'Tap the egg to crack it', naming: 'Give it a name', placeholder: "Your Mochi's name…", confirm: 'Nice to meet you!', hatching: 'Cracking…', mystery: 'A mysterious little one!' },
  home: { focus: 'Focus', menu: 'Menu', feed: 'Feed', heal: 'Medicine', hunger: 'Hunger', mood: 'Mood', health: 'Health', noCandy: 'No candy! Earn some by focusing.', noMed: 'No medicine! Earn some by focusing.', fed: 'Yummy!', healed: 'Feeling better', notSick: 'Not sick right now.', petMax: 'Let it rest, then pet again', critical: 'Mochi needs you!', played: 'So much fun!' },
  focus: { choose: 'How long shall we focus?', custom: 'Custom', min: 'min', start: 'Start', sleeping: 'is sleeping…', focusing: 'focusing', giveUpHold: 'Hold to give up', giveUpHint: 'Its heart will break if you quit…', watchWarn: 'Mochi is watching… come back!', quitToast: 'Mochi got so sad…', complete: 'Session done!', subject: 'Subject', general: 'General', newSubject: 'New subject', subjectName: 'Subject name', add: 'Add' },
  complete: { title: 'You were amazing!', subtitle: 'Mochi is proud of you', rewards: 'Rewards', candy: 'candy', medicine: 'medicine', streak: 'day streak', next: 'Continue', evolveSoon: 'So close to evolving!' },
  evolution: { title: 'EVOLUTION!', label: 'Evolution', toBaby: 'It took shape!', toTeen: 'Mochi grew up!', toLegendary: 'It became legendary!' },
  stage: { blob: 'Blob', baby: 'Baby', teen: 'Teen', legendary: 'Adult' } as Record<string, string>,
  death: { title: 'Farewell…', rip: 'Rest in peace', lived: 'days lived', focusHours: 'focus hrs', toMemorial: 'Send to the Memorial', newEgg: 'Start a new egg', revive: 'Revive', reviveFree: 'Revive (free)', revived: 'Welcome back! 💖', reviveHint: 'Bring them back — free with Premium' },
  memorial: { title: 'Memorial Garden', subtitle: 'The little friends we lost', empty: "You haven't lost anyone yet. Keep it that way.", born: 'Born', died: 'Died', survived: 'Lived' },
  stats: { title: 'Statistics', heatmap: 'Focus calendar', longestStreak: 'Longest streak', totalHours: 'Total focus', totalSessions: 'Total sessions', hours: 'hrs', days: 'days', less: 'less', more: 'more', thisWeek: 'This week', bySubject: 'By subject', noSubjectData: 'Focus with a subject to see it here' },
  shop: { title: 'Shop', buy: 'Buy', owned: 'owned', noCoins: 'Not enough coins!', bought: 'Purchased!', food: 'Food', medicine: 'Medicine', toy: 'Toy', cosmetic: 'Cosmetic', coins: 'coins', confirmBuy: 'Buy', equip: 'Wear', unequip: 'Take off' },
  settings: { title: 'Settings', language: 'Language', sound: 'Sound', soundOn: 'On', soundOff: 'Off' },
  collection: { title: 'Collection', subtitle: 'Species you discovered', locked: 'Locked' },
  items: { candy: 'Candy', apple: 'Apple', fish: 'Fish', cake: 'Cake', medicine: 'Medicine', ball: 'Ball', star_toy: 'Star Toy', bow: 'Bow', crown: 'Crown', top_hat: 'Top Hat', party_hat: 'Party Hat', flower_crown: 'Flower Crown', wizard_hat: 'Wizard Hat', cap: 'Cap', halo: 'Halo', glasses: 'Glasses', sunglasses: 'Sunglasses', headphones: 'Headphones', scarf: 'Scarf', cat_ears: 'Cat Ears', devil_horns: 'Devil Horns', tiara: 'Tiara', heart_glasses: 'Heart Glasses', bowtie: 'Bow Tie' } as Record<string, string>,
  coinReward: 'coins earned!',
  common: { back: 'Back', days: 'days', age: 'Age' },
  premium: {
    menu: 'Premium', title: 'Mochiverse Premium', subtitle: 'Everything, one plan.',
    perMonth: '/mo', cta: 'Subscribe', restore: 'Restore purchase', active: 'Premium active ✨',
    thanks: 'Thank you for supporting Mochiverse! 💖', manage: "You're a Premium member.",
    benefitThemes: 'All premium themes', benefitThemesSub: 'Sunset, aurora, sakura, midnight & more',
    benefitSkins: 'Exclusive pet skins', benefitSkinsSub: 'Golden, cosmic & mint glow',
    benefitStats: 'Pro focus stats', benefitStatsSub: 'Weekly reports, goals & deep charts',
    benefitRevive: 'Free revives', benefitReviveSub: 'Never lose a pet — bring them back free',
    benefitCare: 'Slower decay', benefitCareSub: 'Pets stay happy 40% longer',
    benefitSupport: 'Support development', benefitSupportSub: 'Help keep Mochi growing',
    locked: 'Premium', unlock: 'Unlock with Premium', legal: 'Auto-renews monthly. Cancel anytime.',
  },
  themes: { title: 'Theme', day: 'Day', night: 'Night', sunset: 'Sunset', aurora: 'Aurora', sakura: 'Sakura', midnight: 'Midnight', ocean: 'Ocean', galaxy: 'Galaxy', candy: 'Candy', forest: 'Forest', dawn: 'Dawn', ember: 'Ember', frost: 'Frost' },
  skins: { title: 'Pet skin', original: 'Original', golden: 'Golden', cosmic: 'Cosmic', mint: 'Mint', rainbow: 'Rainbow', shadow: 'Shadow', rose: 'Rose', aqua: 'Aqua' },
  pro: { title: 'Pro insights', weekTotal: 'This week', goalHint: 'Set weekly focus goals with Premium', locked: 'Unlock Pro stats', weeklyGoal: 'Weekly goal', setGoal: 'Goal', goalReached: 'Goal reached! 🎉', ofGoal: 'of goal', noGoal: 'No goal' },
  coins: { title: 'Get coins', subtitle: 'Top up your coin balance', popular: 'POPULAR', bestValue: 'BEST VALUE', got: 'Coins added! 🪙', unit: 'coins', legal: 'One-time purchase. Coins are added instantly.' },
  sounds: { title: 'Focus sound', off: 'Silent', lofi: 'Lofi', piano: 'Piano', rain: 'Rain' },
  reminder: { title: 'Daily reminder', off: 'Off', set: 'Remind me at', on: 'On' },
};

export type Dict = typeof EN;
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

// --- Core-string overrides for the remaining languages (fall back to EN). ---
const ES: DeepPartial<Dict> = {
  home: { focus: 'Concentrar', feed: 'Alimentar', heal: 'Medicina', hunger: 'Hambre', mood: 'Ánimo', health: 'Salud', critical: '¡Mochi te necesita!', fed: '¡Delicioso!' },
  focus: { choose: '¿Cuánto nos concentramos?', custom: 'Personal', min: 'min', start: 'Empezar', sleeping: 'está durmiendo…', giveUpHold: 'Mantén para rendirte' },
  complete: { title: '¡Estuviste genial!', subtitle: 'Mochi está orgulloso', rewards: 'Recompensas', next: 'Continuar', streak: 'días seguidos' },
  evolution: { title: '¡EVOLUCIÓN!', toTeen: '¡Mochi creció!', toLegendary: '¡Se volvió legendario!' },
  shop: { title: 'Tienda', buy: 'Comprar', noCoins: '¡Monedas insuficientes!', bought: '¡Comprado!', food: 'Comida', medicine: 'Medicina', toy: 'Juguete', cosmetic: 'Adorno', coins: 'monedas', confirmBuy: 'Comprar' },
  settings: { title: 'Ajustes', language: 'Idioma', sound: 'Sonido', soundOn: 'Sí', soundOff: 'No' },
  collection: { title: 'Colección', subtitle: 'Especies descubiertas', locked: 'Bloqueado' },
  stats: { title: 'Estadísticas' }, memorial: { title: 'Jardín Conmemorativo' }, death: { title: 'Adiós…' },
  common: { back: 'Atrás' },
};
const FR: DeepPartial<Dict> = {
  home: { focus: 'Se concentrer', feed: 'Nourrir', heal: 'Médicament', hunger: 'Faim', mood: 'Humeur', health: 'Santé', critical: 'Mochi a besoin de toi !', fed: 'Délicieux !' },
  focus: { choose: 'On se concentre combien de temps ?', custom: 'Perso', min: 'min', start: 'Commencer', sleeping: 'dort…', giveUpHold: 'Maintiens pour abandonner' },
  complete: { title: 'Tu étais génial !', subtitle: 'Mochi est fier de toi', rewards: 'Récompenses', next: 'Continuer', streak: 'jours de suite' },
  evolution: { title: 'ÉVOLUTION !', toTeen: 'Mochi a grandi !', toLegendary: 'Devenu légendaire !' },
  shop: { title: 'Boutique', buy: 'Acheter', noCoins: 'Pas assez de pièces !', bought: 'Acheté !', food: 'Nourriture', medicine: 'Médicament', toy: 'Jouet', cosmetic: 'Déco', coins: 'pièces', confirmBuy: 'Acheter' },
  settings: { title: 'Paramètres', language: 'Langue', sound: 'Son', soundOn: 'Oui', soundOff: 'Non' },
  collection: { title: 'Collection', subtitle: 'Espèces découvertes', locked: 'Verrouillé' },
  stats: { title: 'Statistiques' }, memorial: { title: 'Jardin du Souvenir' }, death: { title: 'Adieu…' },
  common: { back: 'Retour' },
};
const DE: DeepPartial<Dict> = {
  home: { focus: 'Fokussieren', feed: 'Füttern', heal: 'Medizin', hunger: 'Hunger', mood: 'Laune', health: 'Gesundheit', critical: 'Mochi braucht dich!', fed: 'Lecker!' },
  focus: { choose: 'Wie lange fokussieren wir?', custom: 'Eigen', min: 'Min', start: 'Start', sleeping: 'schläft…', giveUpHold: 'Halten zum Aufgeben' },
  complete: { title: 'Du warst großartig!', subtitle: 'Mochi ist stolz auf dich', rewards: 'Belohnungen', next: 'Weiter', streak: 'Tage Serie' },
  evolution: { title: 'EVOLUTION!', toTeen: 'Mochi ist gewachsen!', toLegendary: 'Es wurde legendär!' },
  shop: { title: 'Laden', buy: 'Kaufen', noCoins: 'Nicht genug Münzen!', bought: 'Gekauft!', food: 'Essen', medicine: 'Medizin', toy: 'Spielzeug', cosmetic: 'Deko', coins: 'Münzen', confirmBuy: 'Kaufen' },
  settings: { title: 'Einstellungen', language: 'Sprache', sound: 'Ton', soundOn: 'An', soundOff: 'Aus' },
  collection: { title: 'Sammlung', subtitle: 'Entdeckte Arten', locked: 'Gesperrt' },
  stats: { title: 'Statistiken' }, memorial: { title: 'Gedenkgarten' }, death: { title: 'Lebwohl…' },
  common: { back: 'Zurück' },
};
const PT: DeepPartial<Dict> = {
  home: { focus: 'Focar', feed: 'Alimentar', heal: 'Remédio', hunger: 'Fome', mood: 'Humor', health: 'Saúde', critical: 'Mochi precisa de você!', fed: 'Delícia!' },
  focus: { choose: 'Quanto tempo vamos focar?', custom: 'Personal.', min: 'min', start: 'Começar', sleeping: 'está dormindo…', giveUpHold: 'Segure para desistir' },
  complete: { title: 'Você foi incrível!', subtitle: 'Mochi está orgulhoso', rewards: 'Recompensas', next: 'Continuar', streak: 'dias seguidos' },
  evolution: { title: 'EVOLUÇÃO!', toTeen: 'Mochi cresceu!', toLegendary: 'Ficou lendário!' },
  shop: { title: 'Loja', buy: 'Comprar', noCoins: 'Moedas insuficientes!', bought: 'Comprado!', food: 'Comida', medicine: 'Remédio', toy: 'Brinquedo', cosmetic: 'Enfeite', coins: 'moedas', confirmBuy: 'Comprar' },
  settings: { title: 'Configurações', language: 'Idioma', sound: 'Som', soundOn: 'Lig.', soundOff: 'Desl.' },
  collection: { title: 'Coleção', subtitle: 'Espécies descobertas', locked: 'Bloqueado' },
  stats: { title: 'Estatísticas' }, memorial: { title: 'Jardim da Memória' }, death: { title: 'Adeus…' },
  common: { back: 'Voltar' },
};
const ZH: DeepPartial<Dict> = {
  home: { focus: '专注', feed: '喂食', heal: '药', hunger: '饥饿', mood: '心情', health: '健康', critical: 'Mochi 需要你！', fed: '好吃！' },
  focus: { choose: '专注多久呢？', custom: '自定义', min: '分', start: '开始', sleeping: '睡着了…', giveUpHold: '长按放弃' },
  complete: { title: '你太棒了！', subtitle: 'Mochi 为你骄傲', rewards: '奖励', next: '继续', streak: '天连续' },
  evolution: { title: '进化！', toTeen: 'Mochi 长大了！', toLegendary: '成为传说！' },
  shop: { title: '商店', buy: '购买', noCoins: '金币不足！', bought: '已购买！', food: '食物', medicine: '药', toy: '玩具', cosmetic: '装饰', coins: '金币', confirmBuy: '购买' },
  settings: { title: '设置', language: '语言', sound: '声音', soundOn: '开', soundOff: '关' },
  collection: { title: '图鉴', subtitle: '已发现的物种', locked: '未解锁' },
  stats: { title: '统计' }, memorial: { title: '纪念花园' }, death: { title: '再见…' },
  common: { back: '返回' },
};
const JA: DeepPartial<Dict> = {
  home: { focus: '集中', feed: 'ごはん', heal: 'くすり', hunger: 'くうふく', mood: 'きぶん', health: 'けんこう', critical: 'Mochiが呼んでる！', fed: 'おいしい！' },
  focus: { choose: 'どのくらい集中する？', custom: 'カスタム', min: '分', start: 'スタート', sleeping: 'ねむってる…', giveUpHold: '長押しでやめる' },
  complete: { title: 'すごかった！', subtitle: 'Mochiが誇りに思ってる', rewards: 'ごほうび', next: 'つづける', streak: '日れんぞく' },
  evolution: { title: 'しんか！', toTeen: 'Mochiが成長した！', toLegendary: 'でんせつになった！' },
  shop: { title: 'ショップ', buy: '買う', noCoins: 'コインが足りない！', bought: '購入した！', food: '食べ物', medicine: 'くすり', toy: 'おもちゃ', cosmetic: 'かざり', coins: 'コイン', confirmBuy: '買う' },
  settings: { title: 'せってい', language: '言語', sound: '音', soundOn: 'オン', soundOff: 'オフ' },
  collection: { title: 'ずかん', subtitle: '見つけた種', locked: 'ロック中' },
  stats: { title: 'とうけい' }, memorial: { title: '思い出の庭' }, death: { title: 'さよなら…' },
  common: { back: 'もどる' },
};
const HI: DeepPartial<Dict> = {
  home: { focus: 'ध्यान', feed: 'खिलाओ', heal: 'दवा', hunger: 'भूख', mood: 'मूड', health: 'सेहत', critical: 'Mochi को आपकी ज़रूरत है!', fed: 'स्वादिष्ट!' },
  focus: { choose: 'कितनी देर ध्यान करें?', custom: 'कस्टम', min: 'मिनट', start: 'शुरू', sleeping: 'सो रहा है…', giveUpHold: 'छोड़ने के लिए दबाए रखें' },
  complete: { title: 'आप कमाल थे!', subtitle: 'Mochi को आप पर गर्व है', rewards: 'इनाम', next: 'जारी रखें', streak: 'दिन लगातार' },
  evolution: { title: 'विकास!', toTeen: 'Mochi बड़ा हुआ!', toLegendary: 'महान बन गया!' },
  shop: { title: 'दुकान', buy: 'खरीदें', noCoins: 'पर्याप्त सिक्के नहीं!', bought: 'खरीद लिया!', food: 'खाना', medicine: 'दवा', toy: 'खिलौना', cosmetic: 'सजावट', coins: 'सिक्के', confirmBuy: 'खरीदें' },
  settings: { title: 'सेटिंग्स', language: 'भाषा', sound: 'ध्वनि', soundOn: 'चालू', soundOff: 'बंद' },
  collection: { title: 'संग्रह', subtitle: 'खोजी गई प्रजातियाँ', locked: 'बंद' },
  stats: { title: 'आँकड़े' }, memorial: { title: 'स्मृति उद्यान' }, death: { title: 'अलविदा…' },
  common: { back: 'वापस' },
};
const AR: DeepPartial<Dict> = {
  home: { focus: 'تركيز', feed: 'إطعام', heal: 'دواء', hunger: 'جوع', mood: 'مزاج', health: 'صحة', critical: '!موتشي بحاجة إليك', fed: '!لذيذ' },
  focus: { choose: 'كم من الوقت نركز؟', custom: 'مخصص', min: 'دقيقة', start: 'ابدأ', sleeping: '…ينام', giveUpHold: 'اضغط مطولاً للاستسلام' },
  complete: { title: '!لقد كنت رائعاً', subtitle: 'موتشي فخور بك', rewards: 'المكافآت', next: 'متابعة', streak: 'أيام متتالية' },
  evolution: { title: '!تطور', toTeen: '!كبر موتشي', toLegendary: '!أصبح أسطورياً' },
  shop: { title: 'المتجر', buy: 'شراء', noCoins: '!عملات غير كافية', bought: '!تم الشراء', food: 'طعام', medicine: 'دواء', toy: 'لعبة', cosmetic: 'زينة', coins: 'عملات', confirmBuy: 'شراء' },
  settings: { title: 'الإعدادات', language: 'اللغة', sound: 'الصوت', soundOn: 'تشغيل', soundOff: 'إيقاف' },
  collection: { title: 'المجموعة', subtitle: 'الأنواع المكتشفة', locked: 'مقفل' },
  stats: { title: 'الإحصائيات' }, memorial: { title: 'حديقة الذكرى' }, death: { title: '…وداعاً' },
  common: { back: 'رجوع' },
};

// deep-merge a partial override over the English base
function merge<T>(base: T, over: DeepPartial<T> | undefined): T {
  if (!over) return base;
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...base };
  for (const k of Object.keys(over)) {
    const b = (base as any)[k], o = (over as any)[k];
    out[k] = b && typeof b === 'object' && !Array.isArray(b) && o && typeof o === 'object'
      ? merge(b, o) : o ?? b;
  }
  return out;
}

const DICTS: Record<LocaleId, Dict> = {
  en: EN,
  tr: TR as unknown as Dict,
  es: merge(EN, ES), fr: merge(EN, FR), de: merge(EN, DE), pt: merge(EN, PT),
  zh: merge(EN, ZH), ja: merge(EN, JA), hi: merge(EN, HI), ar: merge(EN, AR),
};

export interface LocaleMeta { id: LocaleId; name: string; dir: 'ltr' | 'rtl'; }
export const LOCALES: LocaleMeta[] = [
  { id: 'en', name: 'English', dir: 'ltr' },
  { id: 'tr', name: 'Türkçe', dir: 'ltr' },
  { id: 'es', name: 'Español', dir: 'ltr' },
  { id: 'fr', name: 'Français', dir: 'ltr' },
  { id: 'de', name: 'Deutsch', dir: 'ltr' },
  { id: 'pt', name: 'Português', dir: 'ltr' },
  { id: 'zh', name: '中文', dir: 'ltr' },
  { id: 'ja', name: '日本語', dir: 'ltr' },
  { id: 'hi', name: 'हिन्दी', dir: 'ltr' },
  { id: 'ar', name: 'العربية', dir: 'rtl' },
];

/** Detect the device language and map it to a supported locale (default en). */
export function detectLocale(): LocaleId {
  const langs = (typeof navigator !== 'undefined' && navigator.languages) || ['en'];
  for (const l of langs) {
    const code = l.toLowerCase().split('-')[0] as LocaleId;
    if (DICTS[code]) return code;
  }
  return 'en';
}

export function activeLocale(chosen: LocaleId | null): LocaleId {
  return chosen ?? detectLocale();
}

export function dirFor(locale: LocaleId): 'ltr' | 'rtl' {
  return LOCALES.find((l) => l.id === locale)?.dir ?? 'ltr';
}

/** Reactive translation dictionary hook — re-renders when the locale changes. */
export function useT(): Dict {
  const locale = useGame((s) => s.settings.locale);
  return DICTS[activeLocale(locale)];
}
