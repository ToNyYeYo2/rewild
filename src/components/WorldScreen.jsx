/* eslint-disable react/prop-types */
import WorldComposition from './WorldComposition';
import AvatarSprite from './AvatarSprite';
import { WORLD_STATES, STATE_COLORS, STATE_BANDS } from '../constants/worldStates';
import { DAILY_MAX } from '../utils/scoring';

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
  rollingAverage,
}) {
  const state = WORLD_STATES[worldState];
  const band = STATE_BANDS[worldState] ?? STATE_BANDS.domesticated;
  const color = STATE_COLORS[worldState] ?? STATE_COLORS.domesticated;
  const nextColor = band.nextKey ? STATE_COLORS[band.nextKey] : null;
  const pct = (rollingAverage ?? 0) / DAILY_MAX;
  const rawProgress = band.nextKey
    ? Math.min((pct - band.min) / (band.max - band.min), 1)
    : 1;
  const atEarlyUserCeiling = earlyUser && rawProgress >= 1 && band.nextKey;
  const bandProgress = atEarlyUserCeiling ? 0.9 : rawProgress;

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

      {/* State name + progress — top left */}
      <div className="absolute left-4 z-20" style={{ top: 'max(16px, env(safe-area-inset-top))' }}>
        <div className="text-bone text-xs font-bold uppercase opacity-90"
          style={{ letterSpacing: '0.3em' }}>
          {state?.name}
        </div>
        {/* Progress bar toward next state */}
        <div style={{ width: '180px', marginTop: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
            <span style={{ fontSize: '9px', letterSpacing: '0.12em', fontWeight: 700, color: color.fill }}>{state?.name}</span>
            {nextColor
              ? <span style={{ fontSize: '9px', letterSpacing: '0.12em', color: nextColor.fill }}>{WORLD_STATES[band.nextKey]?.name}</span>
              : <span style={{ fontSize: '9px', letterSpacing: '0.12em', color: color.fill }}>PEAK</span>
            }
          </div>
          <div style={{ height: '10px', background: 'rgba(0,0,0,0.65)', borderRadius: '4px', border: `1px solid ${color.border}` }}>
            <div style={{
              height: '100%',
              width: `${Math.max(bandProgress * 100, 2)}%`,
              background: nextColor
                ? `linear-gradient(to right, ${color.fill}, ${nextColor.fill})`
                : color.fill,
              borderRadius: '4px',
              transition: 'width 1s ease-out',
              boxShadow: `0 0 10px ${color.fill}70`,
            }} />
          </div>
          <div style={{ textAlign: 'right', marginTop: '3px', fontSize: '9px', color: '#6a6058', letterSpacing: '0.08em' }}>
            {Math.round(bandProgress * 100)}%
          </div>
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
