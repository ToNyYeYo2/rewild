/* eslint-disable react/prop-types */
import domesticatedImg from '../assets/domesticated2.jpg';
import awakeningImg    from '../assets/awakening2.jpg';
import primalImg       from '../assets/primal.jpg';
import apexImg         from '../assets/apex.jpg';

// All 4 images are 1024×1024 square. Each scene uses a square container
// sized to the image's rendered footprint with overflow:hidden so animation
// overlays are naturally clipped to the image bounds and don't bleed out.
const SCENES = [
  { id: 'domesticated', src: domesticatedImg, position: 'center center' },
  { id: 'awakening',    src: awakeningImg,    position: 'center center' },
  { id: 'primal',       src: primalImg,       position: 'center 70%'   },
  { id: 'apex',         src: apexImg,         position: 'center center' },
];

// ─── ANIMATION OVERLAYS ──────────────────────────────────────────────────────
// Each overlay fills its parent square via position:absolute inset:0.
// Clipping is handled by overflow:hidden on the square container.

function DomesticatedOverlay() {
  return (
    <>
      {/* Rain layer 1 — nearer */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(170deg, transparent 0, transparent 18px, rgba(180,205,255,0.055) 18px, rgba(180,205,255,0.055) 19.5px)',
        animation: 'rain-overlay 7s linear infinite',
      }} />
      {/* Rain layer 2 — further, slower */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(172deg, transparent 0, transparent 32px, rgba(160,190,240,0.03) 32px, rgba(160,190,240,0.03) 33px)',
        animation: 'rain-overlay 10s linear infinite 2.5s',
      }} />
      {/* TV glow — cool blue, left side, flickers */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 20% 58%, rgba(80,120,225,0.16) 0%, rgba(60,100,210,0.07) 38%, transparent 62%)',
        animation: 'tv-overlay-flicker 5s ease-in-out infinite',
      }} />
    </>
  );
}

function AwakeningOverlay() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 38%, rgba(210,155,55,0.15) 0%, rgba(185,120,30,0.08) 38%, transparent 65%)',
      animation: 'window-glow-pulse 8s ease-in-out infinite',
    }} />
  );
}

function PrimalOverlay() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 38% 78%, rgba(210,100,25,0.22) 0%, rgba(190,130,18,0.12) 28%, transparent 55%)',
      animation: 'campfire-glow-pulse 6s ease-in-out infinite',
    }} />
  );
}

function ApexOverlay() {
  return (
    <>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(90deg, transparent 0%, rgba(20,165,80,0.14) 22%, rgba(45,100,210,0.18) 54%, rgba(135,30,185,0.13) 80%, transparent 100%)',
        animation: 'aurora-shimmer-1 9s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(90deg, transparent 5%, rgba(105,40,205,0.11) 28%, rgba(22,185,115,0.14) 60%, rgba(42,22,168,0.09) 84%, transparent 100%)',
        animation: 'aurora-shimmer-2 13s ease-in-out infinite',
      }} />
    </>
  );
}

const OVERLAY = {
  domesticated: DomesticatedOverlay,
  awakening:    AwakeningOverlay,
  primal:       PrimalOverlay,
  apex:         ApexOverlay,
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function WorldComposition({ worldState, transitioning }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0e0e0e',
    }}>
      {SCENES.map(({ id, src, position }) => {
        const OverlayComponent = OVERLAY[id];
        return (
          <div key={id} style={{
            position: 'absolute',
            // Square container matches image footprint (images are 1024×1024).
            // min(100%, 100dvh) fits whichever axis is smaller.
            width: 'min(100%, 100dvh)',
            aspectRatio: '1 / 1',
            overflow: 'hidden',
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: position,
            backgroundRepeat: 'no-repeat',
            opacity: worldState === id ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
          }}>
            <OverlayComponent />
          </div>
        );
      })}

      {/* Brief dim on commit */}
      {transitioning && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
}
