import { create } from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';

// ============================================================
// Tiny global toast: gentle pill messages ("Mochi seni izliyor…").
// ============================================================

interface ToastItem { id: number; text: string; }
interface ToastStore {
  items: ToastItem[];
  push: (text: string) => void;
  remove: (id: number) => void;
}

let seq = 0;
export const useToastStore = create<ToastStore>((set) => ({
  items: [],
  push: (text) => {
    const id = ++seq;
    set((s) => ({ items: [...s.items, { id, text }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), 2600);
  },
  remove: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

/** call from anywhere */
export const toast = (text: string) => useToastStore.getState().push(text);

export function ToastHost() {
  const items = useToastStore((s) => s.items);
  return (
    <div style={{ position: 'absolute', top: 76, left: 0, right: 0, display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none', zIndex: 60 }}>
      <AnimatePresence>
        {items.map((t) => (
          <motion.div key={t.id} className="toast"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}>
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
