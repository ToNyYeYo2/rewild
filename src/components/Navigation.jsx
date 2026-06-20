/* eslint-disable react/prop-types */
import { Globe, ClipboardList, User, History } from 'lucide-react';

const TABS = [
  { id: 'world', label: 'WORLD', Icon: Globe },
  { id: 'log', label: 'LOG', Icon: ClipboardList },
  { id: 'avatar', label: 'AVATAR', Icon: User },
  { id: 'history', label: 'HISTORY', Icon: History },
];

export default function Navigation({ currentScreen, onNavigate }) {
  return (
    <div className="flex-shrink-0 z-20" style={{
      background: '#0a0a0a',
      borderTop: '1px solid #1e1e1e',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div className="flex">
        {TABS.map(({ id, label, Icon }) => {
          const active = currentScreen === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1"
              style={{
                background: active ? '#141414' : 'transparent',
                border: 'none',
                borderTop: active ? '2px solid #c4622d' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'background 0.3s, border-color 0.3s',
                marginTop: '-1px',
              }}
            >
              <Icon
                size={18}
                color={active ? '#c4622d' : '#3a3a3a'}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span style={{
                fontSize: '9px',
                letterSpacing: '0.15em',
                color: active ? '#e8e0d0' : '#3a3a3a',
                fontWeight: active ? 700 : 400,
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
