/* eslint-disable react/prop-types */
import { useState } from 'react';
import { PILLARS } from '../constants/pillars';
import { getDailyScore } from '../utils/scoring';
import { getTodayStr } from '../utils/storage';

const LEVEL_LABELS = {
  1: 'MINIMAL',
  2: 'SOLID',
  3: 'FULL',
};

function PillarRow({ pillar, value, onChange, readOnly }) {
  return (
    <div className="flex items-center gap-3 py-3" style={{
      borderBottom: '1px solid #1a1a1a',
    }}>
      {/* Icon + label */}
      <div className="flex items-center gap-2 w-36 flex-shrink-0">
        <span className="text-lg leading-none">{pillar.emoji}</span>
        <span style={{
          fontSize: '11px',
          letterSpacing: '0.12em',
          color: '#7a7268',
          fontWeight: 500,
          textTransform: 'uppercase',
        }}>
          {pillar.label}
        </span>
      </div>

      {/* Level selectors */}
      <div className="flex gap-2 flex-1">
        {[1, 2, 3].map(level => {
          const selected = value === level;
          return (
            <button
              key={level}
              onClick={() => !readOnly && onChange(pillar.key, level)}
              disabled={readOnly}
              style={{
                flex: 1,
                padding: '8px 4px',
                background: selected ? '#2a1206' : '#111111',
                border: selected ? '1px solid #c4622d' : '1px solid #1e1e1e',
                color: selected ? '#c4622d' : '#3a3a3a',
                fontSize: '13px',
                fontWeight: selected ? 700 : 400,
                cursor: readOnly ? 'default' : 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '0.05em',
                boxShadow: selected ? '0 0 8px rgba(196,98,45,0.2)' : 'none',
              }}
            >
              {level}
            </button>
          );
        })}
      </div>

      {/* Level label */}
      <div style={{ width: '56px', flexShrink: 0, textAlign: 'right' }}>
        <span style={{
          fontSize: '9px',
          letterSpacing: '0.15em',
          color: value > 0 ? '#c4622d' : '#2a2a2a',
          opacity: value > 0 ? 1 : 0.5,
        }}>
          {value > 0 ? LEVEL_LABELS[value] : '—'}
        </span>
      </div>
    </div>
  );
}

export default function LogScreen({ todayLog, onCommit, todayScore }) {
  const isAlreadyLogged = !!todayLog;
  const [editing, setEditing] = useState(!isAlreadyLogged);
  const [values, setValues] = useState(
    todayLog
      ? { ...todayLog }
      : Object.fromEntries(PILLARS.map(p => [p.key, 0]))
  );

  const currentScore = getDailyScore(values);

  function handleChange(key, level) {
    setValues(prev => ({
      ...prev,
      [key]: prev[key] === level ? 0 : level,
    }));
  }

  function handleCommit() {
    if (currentScore === 0) return;
    onCommit(values);
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  }).toUpperCase();

  return (
    <div className="h-full flex flex-col" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-5 pb-3" style={{
        borderBottom: '1px solid #141414',
      }}>
        <div className="text-xs tracking-[0.2em] opacity-40 mb-1 uppercase">
          {dateStr}
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-bone font-bold tracking-widest uppercase text-lg">
            DAILY LOG
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold" style={{ color: currentScore >= 17 ? '#b8860b' : currentScore >= 12 ? '#c4622d' : currentScore >= 7 ? '#8b3a2a' : '#4a4a4a' }}>
              {currentScore}
            </span>
            <span className="text-xs opacity-40">/ 21</span>
          </div>
        </div>
      </div>

      {/* Pillar rows */}
      <div className="flex-1 panel-scroll px-4">
        {PILLARS.map(pillar => (
          <PillarRow
            key={pillar.key}
            pillar={pillar}
            value={values[pillar.key] || 0}
            onChange={handleChange}
            readOnly={isAlreadyLogged && !editing}
          />
        ))}
        <div className="h-4" />
      </div>

      {/* Action area */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid #141414' }}>
        {isAlreadyLogged && !editing ? (
          <button
            onClick={() => setEditing(true)}
            className="w-full py-3 text-xs tracking-[0.25em] uppercase"
            style={{
              background: 'transparent',
              border: '1px solid #2a2a2a',
              color: '#5a5a5a',
              cursor: 'pointer',
            }}
          >
            EDIT LOG
          </button>
        ) : (
          <button
            onClick={handleCommit}
            disabled={currentScore === 0}
            className="w-full py-4 text-sm tracking-[0.3em] uppercase font-bold"
            style={{
              background: currentScore > 0 ? '#1a0a04' : '#0e0e0e',
              border: `1px solid ${currentScore > 0 ? '#c4622d' : '#1e1e1e'}`,
              color: currentScore > 0 ? '#c4622d' : '#2a2a2a',
              cursor: currentScore > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.4s',
              boxShadow: currentScore > 0 ? '0 0 20px rgba(196,98,45,0.15)' : 'none',
            }}
          >
            COMMIT
          </button>
        )}
      </div>
    </div>
  );
}
