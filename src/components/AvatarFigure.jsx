/* eslint-disable react/prop-types */

const CONFIGS = {
  domesticated: {
    skin: '#363636',
    dark: '#242424',
    light: '#484848',
    groupTransform: 'rotate(9, 120, 260)',
    headCy: 82,
    hasTorch: false,
    hasAura: false,
    eyeColor: '#0e0e0e',
  },
  awakening: {
    skin: '#6e4a2c',
    dark: '#522f14',
    light: '#8e6a4a',
    groupTransform: 'rotate(3, 120, 260)',
    headCy: 76,
    hasTorch: false,
    hasAura: false,
    eyeColor: '#1a0800',
  },
  primal: {
    skin: '#8c5a34',
    dark: '#6a3a18',
    light: '#b07850',
    groupTransform: '',
    headCy: 70,
    hasTorch: true,
    hasAura: false,
    eyeColor: '#200800',
  },
  apex: {
    skin: '#c4622d',
    dark: '#9a3e10',
    light: '#e0844a',
    groupTransform: '',
    headCy: 64,
    hasTorch: true,
    hasAura: true,
    eyeColor: '#3a1000',
    crownColor: '#b8860b',
  },
};

export default function AvatarFigure({ worldState, size = 'normal', hasApexCrown }) {
  const cfg = CONFIGS[worldState] || CONFIGS.domesticated;
  const hY = cfg.headCy;

  // Body landmark Y positions relative to headCy
  const shoulderY = hY + 54;
  const hipY = hY + 164;
  const kneeY = hY + 244;
  const footY = hY + 310;

  const cls = size === 'large'
    ? 'w-52 h-auto drop-shadow-lg'
    : 'w-40 h-auto';

  return (
    <svg viewBox="0 0 240 480" className={cls}>
      <defs>
        <filter id="avatar-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="avatar-glow-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g transform={cfg.groupTransform || undefined}>
        {/* Apex aura */}
        {cfg.hasAura && (
          <ellipse cx="120" cy={hY + 160} rx="72" ry="160"
            fill="none" stroke={cfg.crownColor} strokeWidth="24" opacity="0.05"
            filter="url(#avatar-glow)" />
        )}

        {/* ── HEAD ── */}
        <ellipse cx="120" cy={hY} rx="30" ry="33" fill={cfg.skin} />
        {/* Highlight */}
        <ellipse cx="112" cy={hY - 10} rx="10" ry="9" fill={cfg.light} opacity="0.3" />
        {/* Eyes */}
        <circle cx="112" cy={hY - 2} r="3.5" fill={cfg.eyeColor} />
        <circle cx="128" cy={hY - 2} r="3.5" fill={cfg.eyeColor} />
        {/* Brow ridge */}
        <path d={`M 108 ${hY - 8} Q 112 ${hY - 11} 116 ${hY - 8}`}
          stroke={cfg.dark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d={`M 124 ${hY - 8} Q 128 ${hY - 11} 132 ${hY - 8}`}
          stroke={cfg.dark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Jaw line */}
        <path d={`M 90 ${hY + 10} Q 120 ${hY + 38} 150 ${hY + 10}`}
          stroke={cfg.dark} strokeWidth="1" fill="none" opacity="0.4" />

        {/* Apex crown */}
        {(cfg.hasAura || hasApexCrown) && (
          <g filter="url(#avatar-glow-soft)">
            {Array.from({ length: 5 }, (_, i) => {
              const cx = 96 + i * 12;
              return <line key={i} x1={cx} y1={hY - 34} x2={cx} y2={hY - 44 - (i === 2 ? 6 : 0)}
                stroke={cfg.crownColor} strokeWidth="2.5" strokeLinecap="round" />;
            })}
          </g>
        )}

        {/* ── NECK ── */}
        <rect x="113" y={hY + 31} width="14" height="20" fill={cfg.skin} />

        {/* ── TORSO (trapezoid — wider at shoulders) ── */}
        <path d={`
          M ${120 - 52} ${shoulderY}
          L ${120 + 52} ${shoulderY}
          L ${120 + 36} ${hipY}
          L ${120 - 36} ${hipY}
          Z
        `} fill={cfg.skin} />
        {/* Torso muscle shadow */}
        <path d={`M 120 ${shoulderY + 20} L 120 ${hipY - 20}`}
          stroke={cfg.dark} strokeWidth="2" opacity="0.25" />
        <ellipse cx="120" cy={shoulderY + 40} rx="20" ry="10"
          fill={cfg.dark} opacity="0.12" />

        {/* ── BELT / HIP LINE ── */}
        <rect x={120 - 36} y={hipY} width="72" height="10" fill={cfg.dark} opacity="0.5" />

        {/* ── LEFT ARM (near side) ── */}
        {/* Upper arm */}
        <path d={`
          M ${120 - 46} ${shoulderY + 6}
          L ${120 - 64} ${shoulderY + 80}
          L ${120 - 52} ${shoulderY + 82}
          L ${120 - 34} ${shoulderY + 8}
          Z
        `} fill={cfg.skin} />
        {/* Forearm */}
        <path d={`
          M ${120 - 64} ${shoulderY + 78}
          L ${120 - 72} ${shoulderY + 148}
          L ${120 - 60} ${shoulderY + 150}
          L ${120 - 52} ${shoulderY + 80}
          Z
        `} fill={cfg.dark} />
        {/* Hand */}
        <ellipse cx={120 - 66} cy={shoulderY + 155} rx="10" ry="7" fill={cfg.skin} />

        {/* ── RIGHT ARM (torch side for primal/apex) ── */}
        {/* Upper arm */}
        <path d={`
          M ${120 + 34} ${shoulderY + 6}
          L ${120 + 56} ${shoulderY + 74}
          L ${120 + 46} ${shoulderY + 76}
          L ${120 + 22} ${shoulderY + 8}
          Z
        `} fill={cfg.skin} />
        {cfg.hasTorch ? (
          /* Raised forearm for torch */
          <>
            <path d={`
              M ${120 + 56} ${shoulderY + 72}
              L ${120 + 72} ${shoulderY + 10}
              L ${120 + 62} ${shoulderY + 8}
              L ${120 + 46} ${shoulderY + 70}
              Z
            `} fill={cfg.dark} />
            <ellipse cx={120 + 67} cy={shoulderY + 5} rx="8" ry="6" fill={cfg.skin} />
            {/* Torch */}
            <g>
              <rect x={120 + 62} y={shoulderY - 80} width="8" height="95"
                fill="#2e1a08" rx="2" />
              <rect x={120 + 59} y={shoulderY - 85} width="14" height="16"
                fill="#4a2a10" />
              {/* Flame */}
              <ellipse cx={120 + 66} cy={shoulderY - 100} rx="11" ry="18"
                fill="#8b2000" className="flame-flicker" />
              <ellipse cx={120 + 66} cy={shoulderY - 96} rx="8" ry="14"
                fill="#c4622d" className="flame-flicker-2" />
              <ellipse cx={120 + 66} cy={shoulderY - 92} rx="5" ry="9"
                fill="#b8860b" className="flame-flicker-3" />
              <ellipse cx={120 + 66} cy={shoulderY - 88} rx="2.5" ry="5"
                fill="#e8d080" opacity="0.9" className="flame-flicker" />
            </g>
          </>
        ) : (
          /* Drooping forearm for domesticated/awakening */
          <>
            <path d={`
              M ${120 + 56} ${shoulderY + 72}
              L ${120 + 68} ${shoulderY + 142}
              L ${120 + 56} ${shoulderY + 144}
              L ${120 + 44} ${shoulderY + 74}
              Z
            `} fill={cfg.dark} />
            <ellipse cx={120 + 62} cy={shoulderY + 149} rx="10" ry="7" fill={cfg.skin} />
          </>
        )}

        {/* ── LEGS ── */}
        {/* Left leg */}
        <path d={`
          M ${120 - 32} ${hipY + 8}
          L ${120 - 38} ${kneeY}
          L ${120 - 22} ${kneeY}
          L ${120 - 16} ${hipY + 8}
          Z
        `} fill={cfg.dark} />
        {/* Left shin */}
        <path d={`
          M ${120 - 38} ${kneeY - 2}
          L ${120 - 42} ${footY}
          L ${120 - 26} ${footY}
          L ${120 - 22} ${kneeY - 2}
          Z
        `} fill={cfg.skin} />
        {/* Left foot */}
        <ellipse cx={120 - 34} cy={footY + 6} rx="18" ry="8" fill={cfg.dark} />

        {/* Right leg */}
        <path d={`
          M ${120 + 16} ${hipY + 8}
          L ${120 + 22} ${kneeY}
          L ${120 + 38} ${kneeY}
          L ${120 + 32} ${hipY + 8}
          Z
        `} fill={cfg.dark} />
        {/* Right shin */}
        <path d={`
          M ${120 + 22} ${kneeY - 2}
          L ${120 + 26} ${footY}
          L ${120 + 42} ${footY}
          L ${120 + 38} ${kneeY - 2}
          Z
        `} fill={cfg.skin} />
        {/* Right foot */}
        <ellipse cx={120 + 34} cy={footY + 6} rx="18" ry="8" fill={cfg.dark} />
      </g>
    </svg>
  );
}
