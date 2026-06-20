/* eslint-disable react/prop-types */
import { useState } from 'react';
import { fmtDate, dateNDaysAgo } from '../utils/storage';
import { getDailyScore, getSevenDayAverage } from '../utils/scoring';
import { PILLARS } from '../constants/pillars';

function scoreColor(score) {
  if (score === 0) return '#0e0e0e';
  if (score <= 6) return '#1a0606';
  if (score <= 11) return '#3a1206';
  if (score <= 16) return '#6a2a10';
  return '#b86030';
}

function scoreBorder(score) {
  if (score === 0) return '#181818';
  if (score <= 6) return '#2a0e0e';
  if (score <= 11) return '#5a1e0a';
  if (score <= 16) return '#8b3a1a';
  return '#c46040';
}

// 90-day heatmap
function Heatmap({ logs, onSelectDay, selectedDay }) {
  const cells = [];
  for (let i = 89; i >= 0; i--) {
    const d = dateNDaysAgo(i);
    const ds = fmtDate(d);
    const score = getDailyScore(logs[ds]);
    cells.push({ ds, score, date: d });
  }

  // Group into weeks (columns of 7)
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div>
      <div className="text-xs tracking-[0.2em] opacity-40 uppercase mb-3">90-Day Heatmap</div>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(({ ds, score, date }) => (
              <button
                key={ds}
                onClick={() => onSelectDay(ds === selectedDay ? null : ds)}
                title={`${ds}: ${score}/21`}
                style={{
                  width: '20px', height: '20px',
                  background: scoreColor(score),
                  border: `1px solid ${ds === selectedDay ? '#c4622d' : scoreBorder(score)}`,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Score legend */}
      <div className="flex items-center gap-3 mt-3">
        {[
          { label: 'None', color: '#0e0e0e' },
          { label: '1–6', color: '#1a0606' },
          { label: '7–11', color: '#3a1206' },
          { label: '12–16', color: '#6a2a10' },
          { label: '17–21', color: '#b86030' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1">
            <div style={{ width: '10px', height: '10px', background: color, border: '1px solid #2a2a2a' }} />
            <span style={{ fontSize: '9px', color: '#4a4a4a', letterSpacing: '0.1em' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 30-day line graph SVG
function LineGraph({ logs }) {
  const W = 340, H = 90;
  const DAYS = 30;
  const PAD = { t: 8, r: 8, b: 20, l: 28 };
  const gW = W - PAD.l - PAD.r;
  const gH = H - PAD.t - PAD.b;

  const points = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const ds = fmtDate(dateNDaysAgo(i));
    const score = getDailyScore(logs[ds]);
    points.push({ i: DAYS - 1 - i, score, ds });
  }

  // 7-day rolling average at each point
  const avgPoints = [];
  for (let i = 0; i < DAYS; i++) {
    let sum = 0, count = 0;
    for (let j = Math.max(0, i - 6); j <= i; j++) {
      sum += points[j].score;
      count++;
    }
    avgPoints.push(sum / count);
  }

  function toX(i) { return PAD.l + (i / (DAYS - 1)) * gW; }
  function toY(v) { return PAD.t + gH - (v / 21) * gH; }

  const barPath = points.map(p =>
    `M ${toX(p.i)} ${toY(0)} L ${toX(p.i)} ${toY(p.score)}`
  ).join(' ');

  const linePath = avgPoints.reduce((acc, v, i) => {
    return acc + (i === 0 ? `M ${toX(i)} ${toY(v)}` : ` L ${toX(i)} ${toY(v)}`);
  }, '');

  return (
    <div>
      <div className="text-xs tracking-[0.2em] opacity-40 uppercase mb-3">30-Day Score + Rolling Avg</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {/* Grid lines */}
        {[7, 12, 17].map(v => (
          <line key={v}
            x1={PAD.l} y1={toY(v)} x2={W - PAD.r} y2={toY(v)}
            stroke="#1a1a1a" strokeWidth="1" strokeDasharray="3,3" />
        ))}
        {/* Y axis labels */}
        {[0, 7, 12, 17, 21].map(v => (
          <text key={v} x={PAD.l - 4} y={toY(v) + 3}
            textAnchor="end" fill="#3a3a3a" fontSize="8">
            {v}
          </text>
        ))}
        {/* Daily score bars */}
        {points.map(p => (
          <line key={p.i}
            x1={toX(p.i)} y1={toY(p.score)} x2={toX(p.i)} y2={toY(0)}
            stroke={scoreColor(p.score)} strokeWidth="8" opacity="0.7" />
        ))}
        {/* Rolling average line */}
        <path d={linePath} stroke="#c4622d" strokeWidth="1.5" fill="none" opacity="0.8" />
        {/* State zone shading */}
        <rect x={PAD.l} y={toY(21)} width={gW} height={toY(17) - toY(21)}
          fill="#b8860b" opacity="0.04" />
        <rect x={PAD.l} y={toY(17)} width={gW} height={toY(12) - toY(17)}
          fill="#c4622d" opacity="0.04" />
        <rect x={PAD.l} y={toY(12)} width={gW} height={toY(7) - toY(12)}
          fill="#8b3a2a" opacity="0.04" />
      </svg>
    </div>
  );
}

// Day detail popup
function DayDetail({ dateStr, log }) {
  if (!log) return (
    <div style={{
      background: '#0e0e0e', border: '1px solid #1a1a1a',
      padding: '12px', marginBottom: '16px',
    }}>
      <div className="text-xs tracking-widest opacity-40">{dateStr} — NO LOG</div>
    </div>
  );

  const score = getDailyScore(log);
  return (
    <div style={{
      background: '#0e0e0e', border: '1px solid #1e1208',
      padding: '12px', marginBottom: '16px',
    }}>
      <div className="flex justify-between items-start mb-3">
        <div className="text-xs tracking-widest opacity-60">{dateStr}</div>
        <div className="font-bold" style={{ color: '#c4622d' }}>{score} / 21</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {PILLARS.map(p => (
          <div key={p.key} className="flex items-center gap-1">
            <span style={{ fontSize: '12px' }}>{p.emoji}</span>
            <span style={{
              fontSize: '10px',
              color: (log[p.key] || 0) >= 2 ? '#c4622d' : '#3a3a3a',
              fontWeight: 600,
            }}>
              {log[p.key] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HistoryScreen({ logs }) {
  const [selectedDay, setSelectedDay] = useState(null);

  return (
    <div className="h-full flex flex-col" style={{ background: '#080808' }}>
      <div className="flex-shrink-0 px-4 pt-5 pb-3" style={{ borderBottom: '1px solid #141414' }}>
        <div className="text-bone font-bold tracking-widest uppercase text-lg">HISTORY</div>
      </div>

      <div className="flex-1 panel-scroll px-4 pt-4 pb-6">
        {/* Day detail */}
        {selectedDay && (
          <DayDetail dateStr={selectedDay} log={logs[selectedDay]} />
        )}

        {/* Heatmap */}
        <div className="mb-6">
          <Heatmap logs={logs} onSelectDay={setSelectedDay} selectedDay={selectedDay} />
        </div>

        <div style={{ height: '1px', background: '#141414', marginBottom: '24px' }} />

        {/* Line graph */}
        <LineGraph logs={logs} />
      </div>
    </div>
  );
}
