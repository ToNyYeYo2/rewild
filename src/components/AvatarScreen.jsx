/* eslint-disable react/prop-types */
import { useRef, useState } from 'react';
import AvatarFigure from './AvatarFigure';
import WorldComposition from './WorldComposition';
import { PILLARS } from '../constants/pillars';
import { WORLD_STATES } from '../constants/worldStates';
import { getPillarAverages, getWeakestPillar } from '../utils/scoring';
import { TOTAL_ELEMENTS } from '../utils/unlocks';
import { exportData, importData } from '../utils/storage';

function StatBar({ value, max = 3, label }) {
  const pct = Math.min((value / max) * 100, 100);
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
          background: pct >= 66 ? '#8b3a2a' : pct >= 33 ? '#4a2a1a' : '#2a1a0a',
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
}) {
  const state = WORLD_STATES[worldState];
  const pillarAvgs = getPillarAverages(logs);
  const weakest = getWeakestPillar(pillarAvgs, PILLARS);
  const hasApexCrown = unlockedElements.includes('apex_crown');

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
      {/* World background peek at top */}
      <div className="flex-shrink-0 relative overflow-hidden" style={{ height: '240px' }}>
        <div className="absolute inset-0">
          <WorldComposition worldState={worldState} unlockedElements={unlockedElements} />
        </div>
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(8,8,8,0.85) 100%)'
        }} />
        {/* Avatar */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <AvatarFigure worldState={worldState} size="large" hasApexCrown={hasApexCrown} />
        </div>
      </div>

      {/* Scrollable stats */}
      <div className="flex-1 panel-scroll px-4 pt-4 pb-6">
        {/* State name + description */}
        <div className="mb-5">
          <div className="text-xs tracking-[0.3em] mb-1" style={{ color: '#c4622d' }}>
            {state?.name}
          </div>
          <p style={{ fontSize: '13px', color: '#6a6058', lineHeight: 1.6 }}>
            {state?.description}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#141414', marginBottom: '16px' }} />

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
            <StatBar key={p.key} label={`${p.emoji} ${p.label}`} value={pillarAvgs[p.key]} />
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
