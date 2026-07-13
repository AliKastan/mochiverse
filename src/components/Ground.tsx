import groundImg from '../assets/sprites/bg/day/ground_seamless.png';

// ============================================================
// The soil/grass floor, in the correct visual order:
//   SKY  →  GRASS (with flowers)  →  DIRT down to the bottom panel.
//
// It positions itself ABSOLUTELY at the bottom of its (position:
// relative) container and bleeds 8px past BOTH edges, so grass and
// dirt reach the screen edges together with no side gaps — at any
// width. (A flex item gets centered/shrunk by the parent's layout,
// which was leaving a strip of background beside the dirt; absolute
// left/right pinning avoids that entirely.) Overflow on the parent
// clips the bleed so nothing scrolls.
//
// Two stacked layers:
//  1. A SOLID dirt block filling the lower band edge-to-edge and
//     down to the panel — so no background ever shows beside/below
//     the dirt, but it never appears above the grass.
//  2. The seamless grass+dirt tile (repeat-x). Its top ~14% is
//     transparent so the SKY shows above the blades; grass sits
//     ~14–51% down; its own dirt overlaps the solid band below.
// ============================================================

/** matches the dirt row at the bottom of ground_seamless.png */
const DIRT = 'rgb(193,135,117)';

export function Ground({ height = 78, zIndex = 1 }: { height?: number; zIndex?: number }) {
  const dirtBand = Math.round(height * 0.6);
  return (
    <div
      aria-hidden
      style={{ position: 'absolute', left: -8, right: -8, bottom: 0, height, zIndex, overflow: 'hidden' }}
    >
      {/* solid dirt fill for the lower band — spans the full (bled) width */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: dirtBand, backgroundColor: DIRT }} />
      {/* the seamless grass+dirt tile on top */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${groundImg})`,
        backgroundRepeat: 'repeat-x',
        backgroundSize: 'auto 100%',
        backgroundPosition: 'left bottom',
        imageRendering: 'pixelated',
      }} />
    </div>
  );
}
