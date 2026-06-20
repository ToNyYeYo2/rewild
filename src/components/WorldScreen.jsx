/* eslint-disable react/prop-types */
import WorldComposition from './WorldComposition';
import AvatarSprite from './AvatarSprite';
import { WORLD_STATES } from '../constants/worldStates';

export default function WorldScreen({
  worldState,
  streak,
  todayScore,
  todayLogged,
  unlockedElements,
  onLogPrompt,
  transitioning,
  earlyUser,
  pillarAverages,
}) {
  const state = WORLD_STATES[worldState];

  const EARLY_TEXT = {
    domesticated: 'The first step is showing up.',
    awakening:    'Something is shifting — keep going.',
    primal:       "You're climbing out — don't stop now.",
  };
  const earlyText = earlyUser ? (EARLY_TEXT[worldState] ?? EARLY_TEXT.domesticated) : null;

  // Per-scene avatar position — tune as pixel-art backgrounds are swapped in
  const AVATAR_POS = {
    domesticated: { bottom: '15.5%', left: '34.5%', translateX: '-50%', scale: 3.5 },
    awakening:    { bottom: '15%', left: '53%', translateX: '-50%', scale: 4.2 },
    primal:       { bottom: '22%', left: '38%', translateX: '-50%', scale: 3   },
    apex:         { bottom: '7%',  left: '45%', translateX: '-50%', scale: 1.3 },
  };
  const pos = AVATAR_POS[worldState] ?? AVATAR_POS.domesticated;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* World background */}
      <WorldComposition
        worldState={worldState}
        transitioning={transitioning}
      />

      {/* Gradient vignette — darkens edges so UI reads cleanly */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)'
      }} />
      <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none" style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)'
      }} />
      <div className="absolute inset-x-0 top-0 h-20 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)'
      }} />

      {/* ── LAYER 2: Avatar ── always above the scene, below UI overlays */}
      <div className="absolute z-20 pointer-events-none"
        style={{ bottom: pos.bottom, left: pos.left, transform: `translateX(${pos.translateX})` }}>
        <AvatarSprite worldState={worldState} pillarData={pillarAverages} scale={pos.scale} />
      </div>

      {/* State name — top left */}
      <div className="absolute left-4 z-20" style={{ top: 'max(16px, env(safe-area-inset-top))' }}>
        <div className="text-bone text-xs font-bold uppercase opacity-90"
          style={{ letterSpacing: '0.3em' }}>
          {state?.name}
        </div>
        {earlyText && (
          <div className="text-bone mt-1 opacity-50"
            style={{ fontSize: '10px', letterSpacing: '0.08em', maxWidth: '160px', lineHeight: 1.4 }}>
            {earlyText}
          </div>
        )}
      </div>

      {/* Today score — top right */}
      <div className="absolute right-4 z-20 text-right" style={{ top: 'max(16px, env(safe-area-inset-top))' }}>
        <div className="text-bone text-xl font-bold leading-none">
          {todayScore}
          <span className="text-xs font-normal opacity-50"> / 21</span>
        </div>
        <div className="text-xs opacity-40 tracking-widest mt-0.5">TODAY</div>
      </div>

      {/* Streak — bottom left */}
      {streak > 0 && (
        <div className="absolute bottom-6 left-4 z-20">
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">🔥</span>
            <span className="text-bone text-sm font-bold">{streak}</span>
            <span className="text-bone text-xs opacity-50">days</span>
          </div>
        </div>
      )}

      {/* Log prompt — bottom center */}
      {!todayLogged && (
        <button
          onClick={onLogPrompt}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pulse-slow"
          style={{
            background: 'transparent',
            border: '1px solid rgba(232,224,208,0.3)',
            color: '#e8e0d0',
            padding: '6px 18px',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          LOG TODAY
        </button>
      )}

      {/* Logged indicator */}
      {todayLogged && (
        <div className="absolute bottom-5 right-4 z-20">
          <div className="text-xs opacity-40 tracking-widest uppercase">Logged</div>
        </div>
      )}
    </div>
  );
}
