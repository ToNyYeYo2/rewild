/* eslint-disable react/prop-types */
import bodysoft     from '../assets/body-soft.png';
import bodyaverage  from '../assets/body-average.png';
import bodymuscular from '../assets/body-muscular.png';
import armsthin     from '../assets/arms-thin.png';
import armsnormal   from '../assets/arms-normal.png';
import armsmuscular from '../assets/arms-muscular.png';

// ── ARM ALIGNMENT ─────────────────────────────────────────────────────────────
// Tune here if the arms don't line up on the body shoulders.
// x/y are in canvas units — they scale proportionally with the figure
// (e.g. x:2 at scale 3.5 = 7px right at every world state).
// scale adjusts the arms layer size relative to the body layer.
const ARMS_OFFSET = { x: 0, y: 0, scale: 1 };

// ── BAND THRESHOLDS (pillar averages run 0–3) ─────────────────────────────────
// low  → 0 – 1.49   (no/minimal logging)
// mid  → 1.5 – 2.29 (consistent moderate effort)
// high → 2.3+       (near-daily max)
const LOW_BAND  = 1.5;
const HIGH_BAND = 2.3;

function getBand(avg) {
  if (avg >= HIGH_BAND) return 'high';
  if (avg >= LOW_BAND)  return 'mid';
  return 'low';
}

// ── ASSET REGISTRIES ──────────────────────────────────────────────────────────
// Swap any entry here to introduce new body/arm variants without touching logic.
const BODY_ASSETS = {
  low:  bodysoft,
  mid:  bodyaverage,
  high: bodymuscular,
};

const ARMS_ASSETS = {
  low:  armsthin,
  mid:  armsnormal,
  high: armsmuscular,
};

// Natural canvas size at scale=1. Adjust if Canva exports use a different aspect.
const BASE_W = 56;
const BASE_H = 100;

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function AvatarSprite({ worldState, pillarData, scale = 1 }) {
  // Pull individual pillar averages (0–3). Default 0 so no-data state is valid.
  const nourishment = pillarData?.nourishment ?? 0;
  const movement    = pillarData?.movement    ?? 0;
  const sun         = pillarData?.sun         ?? 0;
  const sleep       = pillarData?.sleep       ?? 0;
  const cold        = pillarData?.cold        ?? 0;
  const grounding   = pillarData?.grounding   ?? 0;
  const hydration   = pillarData?.hydration   ?? 0;

  // Layer selection
  const bodyKey = getBand(nourishment);
  const armsKey = getBand(movement);

  // ── CSS EFFECTS (applied to the whole assembled figure) ────────────────────

  // Overall condition proxy: mean of all 7 pillar averages / 3
  const overallPct =
    (sun + nourishment + movement + sleep + cold + grounding + hydration) / 21;

  // Brightness: dim when no pillars are filled, brighter as overall improves.
  // Floor at 0.85 so a brand-new user isn't pitch-dark.
  const brightness = (0.85 + overallPct * 0.35).toFixed(2);

  // Skin warmth from sun: low sun → slight sepia desaturation;
  // high sun → subtle saturation boost.
  const sunPct    = sun / 3;
  const sepia     = sun < 1.5 ? ((1.5 - sun) / 1.5 * 0.2).toFixed(2) : null;
  const saturate  = sun > 1.5 ? (1 + (sun - 1.5) / 1.5 * 0.2).toFixed(2) : null;

  // Grounding glow: earthy green drop-shadow that grows with grounding average.
  const glowPx = grounding > 1 ? ((grounding - 1) / 2 * 7).toFixed(1) : null;

  const filter = [
    sepia    && `sepia(${sepia})`,
    saturate && `saturate(${saturate})`,
    `brightness(${brightness})`,
    glowPx   && `drop-shadow(0 0 ${glowPx}px rgba(100,160,50,0.35))`,
    'drop-shadow(0 3px 8px rgba(0,0,0,0.85))',
  ].filter(Boolean).join(' ');

  // Posture from vitality (sleep + cold): low vitality → 1–2° forward slump.
  const vitalityPct = (sleep + cold) / 6;
  const slumpDeg    = ((1 - vitalityPct) * 2).toFixed(1);
  const posture     = parseFloat(slumpDeg) > 0.3 ? `rotate(${slumpDeg}deg)` : undefined;

  const w = Math.round(BASE_W * scale);
  const h = Math.round(BASE_H * scale);

  // Arms alignment: offset is in canvas units, converted to screen pixels at runtime.
  const armsTransform =
    ARMS_OFFSET.x !== 0 || ARMS_OFFSET.y !== 0 || ARMS_OFFSET.scale !== 1
      ? `translate(${ARMS_OFFSET.x * scale}px, ${ARMS_OFFSET.y * scale}px) scale(${ARMS_OFFSET.scale})`
      : undefined;

  return (
    // Outer div: sizing, posture tilt, CSS filter effects.
    // Keep filter here so it wraps both layers as a single composited figure.
    <div
      className="avatar-sprite"
      data-world-state={worldState}
      style={{ width: w, height: h, position: 'relative', transform: posture, filter }}
    >
      {/* Inner div: idle breathing bob.  Separated from posture so CSS animation
          transform (translateY) doesn't clobber the inline posture rotate. */}
      <div className="avatar-idle" style={{ position: 'absolute', inset: 0 }}>

        {/* Body layer — bottom.  key change triggers fade-in via .avatar-layer */}
        <img
          key={`body-${bodyKey}`}
          src={BODY_ASSETS[bodyKey]}
          alt=""
          className="avatar-layer"
          draggable={false}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />

        {/* Arms layer — top.  Same origin; ARMS_OFFSET lets you nudge alignment. */}
        <img
          key={`arms-${armsKey}`}
          src={ARMS_ASSETS[armsKey]}
          alt=""
          className="avatar-layer"
          draggable={false}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: armsTransform,
            transformOrigin: 'top left',
          }}
        />

      </div>
    </div>
  );
}
