# Mochiverse — PixelLab asset generation plan

Ready-to-run the instant the PixelLab MCP reconnects (currently `401` in-session).
Every asset below maps to an exact tool call + prompt + wiring target. The React
layout, animation and game logic stay; only the **visual assets** become PixelLab
pixel art.

**Shared style string** (reuse in every prompt):
`soft rounded chibi kawaii pixel art, pastel candy colors (pink lavender mint sky-blue peach), big sparkly eyes, rosy blush cheeks, thick clean outline, cozy, high detail`

**Global palette hint:** `pastel pink, lavender, mint, sky blue, peach`

---

## 0. Preflight
- `get_balance` — confirm connection + credits before spending.
- `list_projects` — optional, to attach a git-backed project.

---

## 1. Characters — 5 species × 3 stages (identity-preserved via state chaining)

Chaining `create_character_state` keeps the same creature identity across evolution,
which is exactly what a Tamagotchi wants.

**Per species — base (baby):** `create_character`
- `mode: "v3"` (highest quality, 8 directions), `size: 64`, `view: "side"`,
  `body_type: "humanoid"`, `proportions: {"type":"preset","name":"chibi"}`
- descriptions:
  | species | description |
  |---|---|
  | mochi | `round squishy blob creature, soft pastel pink body, big sparkly eyes, rosy blush cheeks, tiny feet` + style |
  | pao | `round chibi creature, pastel lavender purple body, little star on forehead, big sparkly eyes, blush cheeks` + style |
  | yuki | `round chibi creature, pastel sky-blue body, calm snowflake motif, big sparkly eyes, blush cheeks` + style |
  | kiwi | `round chibi creature, pastel mint-green body, tiny leaf sprout on head, big sparkly eyes, blush cheeks` + style |
  | nori | `round chibi creature, pastel peach body, tiny sun tuft, big sparkly eyes, blush cheeks` + style |

**Per species — teen:** `create_character_state(baby_id, "slightly taller older form, small pointy ears, a little more defined", use_color_palette_from_reference: true)`

**Per species — legendary:** `create_character_state(teen_id, "majestic legendary form wearing a small golden crown, sparkle accents", use_color_palette_from_reference: true)`

→ 15 character records. Front sprite = the **south** rotation frame.

### 1b. States & animations (per species × stage = 15 subjects)
The registry falls back to `idle` when a state is missing, so these can be added
progressively without breaking the app.

- **idle** — `animate_character(id, mode:"v3", action_description:"gentle idle breathing bounce", directions:["south"], frame_count:6)`
- **happy** — `animate_character(id, mode:"v3", action_description:"jumping up happily with joy, sparkles", directions:["south"], frame_count:8)`
- **sad** — `create_character_state(id, "teary drooping sad expression, slumped")`
- **sick** — `create_character_state(id, "sick, greenish tint, dizzy woozy spiral eyes, queasy")`
- **sleeping** — `create_character_state(id, "sleeping peacefully, eyes closed, tiny Zzz")`
- **ghost** — `create_character_state(id, "cute translucent pale ghost spirit form, faded, floating")`

Retrieve frames with `get_character(id)`; save PNG frames under
`src/assets/sprites/<species>/<stage>/<state>_<n>.png`.

---

## 2. Egg — 4 crack stages
`create_1_direction_object`, `view:"top-down"`, `size:96`, one call per stage
(select best candidate with `select_object_frames`):
1. `intact pastel pink spotted egg, soft highlight` + style
2. `pastel egg with a single small crack` + style
3. `pastel egg with spreading cracks, glowing seam` + style
4. `pastel egg splitting open with warm light bursting out` + style

→ `src/assets/sprites/egg/egg_0..3.png` → register in `EGG_FRAMES`.

---

## 3. Parallax background layers (keep CSS drift/twinkle, swap each layer's art)
`create_1_direction_object` / `create_map_object`, transparent PNGs:
- `cloud` — `fluffy soft pastel white cloud` (size 96) ×2 variants
- `island` — `small floating grassy mint island with soft soil bottom` (size 96)
- `sun` — `soft glowing warm pastel sun` (size 80)
- `moon` — `soft glowing pale moon` (size 80)
- `star` — `tiny sparkle star, white` (size 32)
- `aurora` — `soft wispy aurora light streak` (size 128)
- `hills` — `rolling pastel green hill silhouette strip` (size 160, wide)

→ new `src/assets/sprites/bg/*` consumed by `SkyBackground.tsx` / `NightBackground.tsx`
(replace the inline SVG shapes; the `<motion.div>` drift wrappers stay).

---

## 4. UI assets
`create_ui_asset` (20–40 gens each), `color_palette:"pastel pink and lavender"`,
`no_background:true`:
- **primary button** — `elements:["button"]`, `chunky glossy candy button, pastel pink to lavender gradient, rounded, soft drop shadow`
- **mint button** — same, `mint to sky-blue gradient`
- **peach button** — same, `peach to pink gradient`
- **panel / card** — `elements:["panel"]`, `soft frosted pastel rounded glass panel`
- **stat bar** — `elements:["health_bar"]`, `cute rounded pastel stat bar frame` (tint fill per stat in CSS)
- **chip** — `elements:["button"]`, small `rounded pastel pill chip`

→ 9-slice or fixed-size PNGs used by `.btn` / `.glass` / `StatBar` (swap CSS bg for `image-set`/`border-image`).

## 5. Icons
`create_1_direction_object`, `view:"top-down"`, `size:64`, pick best candidate:
`candy`, `medicine pill/bottle`, `heart`, `flame (streak)`, `gravestone`, `sparkle`, `speaker` (mute) — each `<thing>, cute pastel pixel-art icon, thick outline`.

→ `src/assets/sprites/icons/*` → replace SVGs in `components/Icons.tsx`.

---

## Execution order & cost awareness
1. **Phase A (make it visibly PixelLab):** 5 baby bases + idle anim, egg, bg layers, icons, buttons/panel. → `get_balance` check-in.
2. **Phase B:** teen + legendary states.
3. **Phase C:** full state set (happy/sad/sick/sleeping/ghost) per stage.

Cost notes: characters/states/v3-anims ≈ 1–9 gens each; **UI assets & 1-direction objects ≈ 20–40 gens each** (the pricier items). I'll run `get_balance` first and after Phase A, and pause for confirmation before any `pro`-mode spend.

Wiring is centralized: monsters/egg → `src/assets/registry.ts`; bg/icons/ui → their existing components. `MonsterView` auto-plays real frames wherever the registry has them, so the app upgrades incrementally with zero rework.
