/* eslint-disable react/prop-types */
import { useRef, useState } from 'react';
import AvatarSprite from './AvatarSprite';
import { STATE_COLORS, STATE_BANDS as SBANDS, WORLD_STATES } from '../constants/worldStates';
import { PILLARS } from '../constants/pillars';
import { getPillarAverages, getWeakestPillar, DAILY_MAX } from '../utils/scoring';
import { TOTAL_ELEMENTS } from '../utils/unlocks';
import { exportData, importData } from '../utils/storage';

const TIER_LOW  = 1.5;
const TIER_HIGH = 2.3;

const TIER_LABELS = {
  nourishment: { low: 'OVERWEIGHT', mid: 'SKINNY FAT', high: 'RIPPED' },
  movement:    { low: 'WEAK',       mid: 'AVERAGE',    high: 'JACKED'  },
};

const TIER_COLORS = { low: '#6B7280', mid: '#16A34A', high: '#0891B2' };

function TierBar({ avg, pillarKey }) {
  const labels = TIER_LABELS[pillarKey];
  let progress, currentKey, nextKey;
  if (avg >= TIER_HIGH) {
    progress = 1; currentKey = 'high'; nextKey = null;
  } else if (avg >= TIER_LOW) {
    progress = (avg - TIER_LOW) / (TIER_HIGH - TIER_LOW);
    currentKey = 'mid'; nextKey = 'high';
  } else {
    progress = avg / TIER_LOW;
    currentKey = 'low'; nextKey = 'mid';
  }
  const currentTier = labels[currentKey];
  const nextTier    = nextKey ? labels[nextKey] : null;
  const currentColor = TIER_COLORS[currentKey];
  const nextColor    = nextKey ? TIER_COLORS[nextKey] : TIER_COLORS.high;
  return (
    <div style={{ marginTop: '16px' }}>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-xs tracking-[0.25em] font-bold" style={{ color: currentColor }}>
          {currentTier}
        </span>
        {nextTier
          ? <span className="text-xs tracking-[0.15em]" style={{ color: nextColor }}>{nextTier}</span>
          : <span className="text-xs tracking-[0.15em]" style={{ color: nextColor }}>PEAK</span>
        }
      </div>
      <div style={{ height: '8px', background: '#111', borderRadius: '3px', border: `1px solid ${currentColor}60` }}>
        <div style={{
          height: '100%',
          width: `${Math.max(progress * 100, 2)}%`,
          background: nextKey ? `linear-gradient(to right, ${currentColor}, ${nextColor})` : currentColor,
          borderRadius: '3px',
          transition: 'width 1s ease-out',
          boxShadow: `0 0 6px ${currentColor}60`,
        }} />
      </div>
      <div style={{ textAlign: 'right', marginTop: '4px', fontSize: '10px', color: '#4a4a4a', letterSpacing: '0.08em' }}>
        {Math.round(progress * 100)}%
      </div>
    </div>
  );
}

function StatBar({ value, max = 3, label, fillColor = '#8b3a2a', glowColor = 'rgba(139,58,42,0.35)', isWeak = false }) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor = isWeak ? fillColor + '70' : fillColor;
  const glow = isWeak ? 'none' : `0 0 5px ${glowColor}`;
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <span style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#5a5a5a', textTransform: 'uppercase' }}>
          {label}
        </span>
        <span style={{ fontSize: '11px', color: '#8a7a6a', fontWeight: 600 }}>
          {value.toFixed(1)}
        </span>
      </div>
      <div style={{ height: '4px', background: '#1a1a1a' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: barColor,
          boxShadow: glow,
          transition: 'width 0.8s ease-out',
        }} />
      </div>
    </div>
  );
}

export default function AvatarScreen({
  worldState,
  streak,
  longestStreak,
  rollingAverage,
  logs,
  unlockedElements,
  onImport,
  earlyUser,
}) {
  const state = WORLD_STATES[worldState];
  const pillarAvgs = getPillarAverages(logs);
  const weakest = getWeakestPillar(pillarAvgs, PILLARS);

  const band = SBANDS[worldState] ?? SBANDS.domesticated;
  const color = STATE_COLORS[worldState] ?? STATE_COLORS.domesticated;
  const nextColor = band.nextKey ? STATE_COLORS[band.nextKey] : null;
  const pct = rollingAverage / DAILY_MAX;
  const rawProgress = band.nextKey
    ? Math.min((pct - band.min) / (band.max - band.min), 1)
    : 1;
  // Cap at 90% when earlyUser is holding the player below the next state
  const atEarlyUserCeiling = earlyUser && rawProgress >= 1 && band.nextKey;
  const bandProgress = atEarlyUserCeiling ? 0.9 : rawProgress;

  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null); // null | 'ok' | 'err'

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importData(ev.target.result);
        setImportStatus('ok');
        setTimeout(() => { setImportStatus(null); onImport?.(); }, 1200);
      } catch (err) {
        setImportStatus(err.message || 'Import failed.');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: '#080808' }}>
      {/* Avatar hero */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center relative" style={{ height: '300px' }}>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 80%, rgba(139,58,42,0.10) 0%, transparent 68%)',
        }} />
        <AvatarSprite worldState={worldState} pillarData={pillarAvgs} scale={3} />
        <div className="absolute bottom-3 text-xs tracking-[0.3em]" style={{ color: '#c4622d' }}>
          {state?.name}
        </div>
      </div>

      {/* Scrollable stats */}
      <div className="flex-1 panel-scroll px-4 pt-4 pb-6">

        {/* State progression bar */}
        <div className="mb-5">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs tracking-[0.25em] font-bold" style={{ color: color.fill }}>
              {state?.name}
            </span>
            {nextColor
              ? <span className="text-xs tracking-[0.15em]" style={{ color: nextColor.fill }}>{WORLD_STATES[band.nextKey]?.name}</span>
              : <span className="text-xs tracking-[0.15em]" style={{ color: color.fill }}>PEAK</span>
            }
          </div>
          <div style={{ height: '8px', background: '#111', borderRadius: '3px', border: `1px solid ${color.border}` }}>
            <div style={{
              height: '100%',
              width: `${Math.max(bandProgress * 100, 2)}%`,
              background: nextColor
                ? `linear-gradient(to right, ${color.fill}, ${nextColor.fill})`
                : color.fill,
              borderRadius: '3px',
              transition: 'width 1s ease-out',
              boxShadow: `0 0 8px ${color.fill}60`,
            }} />
          </div>
          <div style={{ textAlign: 'right', marginTop: '4px', fontSize: '10px', color: '#4a4a4a', letterSpacing: '0.08em' }}>
            {Math.round(bandProgress * 100)}%
          </div>
          <TierBar avg={pillarAvgs.nourishment} pillarKey="nourishment" />
          <TierBar avg={pillarAvgs.movement} pillarKey="movement" />
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#141414', marginBottom: '16px' }} />

        {/* State description */}
        <div className="mb-5">
          <p style={{ fontSize: '13px', color: '#6a6058', lineHeight: 1.6 }}>
            {state?.description}
          </p>
        </div>

        {/* Streak stats */}
        <div className="flex gap-4 mb-5">
          <div className="flex-1" style={{ background: '#0e0e0e', padding: '12px', border: '1px solid #1a1a1a' }}>
            <div className="text-xs opacity-40 tracking-widest uppercase mb-1">Streak</div>
            <div className="text-2xl font-bold" style={{ color: '#c4622d' }}>{streak}</div>
            <div className="text-xs opacity-30">days</div>
          </div>
          <div className="flex-1" style={{ background: '#0e0e0e', padding: '12px', border: '1px solid #1a1a1a' }}>
            <div className="text-xs opacity-40 tracking-widest uppercase mb-1">Longest</div>
            <div className="text-2xl font-bold text-bone">{longestStreak}</div>
            <div className="text-xs opacity-30">days</div>
          </div>
          <div className="flex-1" style={{ background: '#0e0e0e', padding: '12px', border: '1px solid #1a1a1a' }}>
            <div className="text-xs opacity-40 tracking-widest uppercase mb-1">7-Day Avg</div>
            <div className="text-2xl font-bold text-bone">{rollingAverage.toFixed(1)}</div>
            <div className="text-xs opacity-30">/ 21</div>
          </div>
        </div>

        {/* Pillar averages */}
        <div className="mb-5">
          <div className="text-xs tracking-[0.2em] opacity-40 uppercase mb-3">
            7-Day Pillar Average
          </div>
          {PILLARS.map(p => (
            <StatBar
              key={p.key}
              label={`${p.emoji} ${p.label}`}
              value={pillarAvgs[p.key]}
              fillColor={color.fill}
              glowColor={color.border}
              isWeak={p.key === weakest?.key}
            />
          ))}
        </div>

        {/* Weakest pillar callout */}
        {weakest && (
          <div className="mb-5 px-3 py-3" style={{
            border: '1px solid #2a1206',
            background: '#0e0806',
          }}>
            <div className="text-xs tracking-[0.15em] uppercase mb-1" style={{ color: '#8b3a2a' }}>
              Weak Link
            </div>
            <div style={{ fontSize: '13px', color: '#7a6a5a', lineHeight: 1.5 }}>
              Your <span style={{ color: '#c4622d', fontWeight: 600 }}>
                {weakest.emoji} {weakest.label}
              </span> is pulling you back. ({pillarAvgs[weakest.key].toFixed(1)} avg)
            </div>
          </div>
        )}

        {/* Unlocked elements */}
        <div className="mb-6">
          <div className="text-xs tracking-[0.2em] opacity-40 uppercase mb-2">
            World Elements
          </div>
          <div style={{ fontSize: '13px', color: '#5a5a5a' }}>
            <span style={{ color: '#e8e0d0', fontWeight: 600 }}>
              {unlockedElements.length}
            </span> of {TOTAL_ELEMENTS} earned
          </div>
          <div style={{ height: '4px', background: '#141414', marginTop: '8px' }}>
            <div style={{
              height: '100%',
              width: `${(unlockedElements.length / TOTAL_ELEMENTS) * 100}%`,
              background: '#8b3a2a',
              transition: 'width 0.8s',
            }} />
          </div>
        </div>

        {/* Data portability */}
        <div style={{ borderTop: '1px solid #141414', paddingTop: '16px' }}>
          <div className="text-xs tracking-[0.2em] opacity-40 uppercase mb-3">Data</div>
          <div className="flex gap-3">
            <button
              onClick={exportData}
              style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid #2a2a2a',
                color: '#6a6058',
                padding: '9px 0',
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid #2a2a2a',
                color: '#6a6058',
                padding: '9px 0',
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
          </div>
          {importStatus && (
            <div style={{
              marginTop: '8px',
              fontSize: '10px',
              letterSpacing: '0.1em',
              color: importStatus === 'ok' ? '#8b3a2a' : '#6a4040',
            }}>
              {importStatus === 'ok' ? 'Data restored.' : importStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
