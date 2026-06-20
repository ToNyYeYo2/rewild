/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import WorldComposition from './WorldComposition';

export default function OnboardingScreen({ onComplete }) {
  const [phase, setPhase] = useState(0);

  // Auto-advance after 2.2s
  useEffect(() => {
    if (phase === 0) {
      const t = setTimeout(() => setPhase(1), 2200);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div className="relative h-full w-full overflow-hidden flex items-center justify-center"
      onClick={() => phase === 0 && setPhase(1)}>
      {/* World behind text — always domesticated for first launch */}
      <div className="absolute inset-0">
        <WorldComposition worldState="domesticated" unlockedElements={[]} />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.75)' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8"
        style={{ maxWidth: '320px' }}>

        <div
          key={phase}
          style={{
            opacity: 1,
            animation: 'fadeIn 0.8s ease-in-out',
          }}>

          {phase === 0 && (
            <p style={{
              fontSize: '22px',
              fontWeight: 300,
              color: '#e8e0d0',
              letterSpacing: '0.02em',
              lineHeight: 1.5,
            }}>
              This is what modern life<br />has done to you.
            </p>
          )}

          {phase === 1 && (
            <div className="flex flex-col items-center gap-10">
              <p style={{
                fontSize: '22px',
                fontWeight: 300,
                color: '#e8e0d0',
                letterSpacing: '0.02em',
                lineHeight: 1.5,
              }}>
                Take it back.
              </p>
              <button
                onClick={onComplete}
                style={{
                  background: '#0e0806',
                  border: '1px solid #c4622d',
                  color: '#c4622d',
                  padding: '14px 48px',
                  fontSize: '13px',
                  letterSpacing: '0.35em',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  boxShadow: '0 0 24px rgba(196,98,45,0.2)',
                }}
              >
                BEGIN
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
