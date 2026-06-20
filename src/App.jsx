import { useState, useEffect, useCallback } from 'react';
import { getData, saveData, getTodayStr } from './utils/storage'; // eslint-disable-line no-unused-vars
import { computeAppState } from './utils/scoring';
import { checkAndUpdateUnlocks } from './utils/unlocks';
import Navigation from './components/Navigation';
import OnboardingScreen from './components/OnboardingScreen';
import WorldScreen from './components/WorldScreen';
import LogScreen from './components/LogScreen';
import AvatarScreen from './components/AvatarScreen';
import HistoryScreen from './components/HistoryScreen';

export default function App() {
  const [data, setData] = useState(null);
  const [appState, setAppState] = useState(null);
  const [screen, setScreen] = useState('world');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const stored = getData();

    if (!stored.hasOnboarded) {
      if (!stored.firstOpenDate) stored.firstOpenDate = getTodayStr();
      setShowOnboarding(true);
    }

    const computed = computeAppState(stored);
    stored.currentStreak = computed.streak;
    stored.longestStreak = computed.longestStreak;
    stored.unlockedElements = checkAndUpdateUnlocks(
      stored.logs,
      computed.streak,
      computed.longestStreak,
      stored.unlockedElements
    );

    saveData(stored);
    setData(stored);
    setAppState(computed);
  }, []);

  const handleLogCommit = useCallback((log) => {
    setData(prev => {
      const next = {
        ...prev,
        logs: { ...prev.logs, [getTodayStr()]: log },
      };
      const computed = computeAppState(next);
      next.currentStreak = computed.streak;
      next.longestStreak = computed.longestStreak;
      next.unlockedElements = checkAndUpdateUnlocks(
        next.logs,
        computed.streak,
        computed.longestStreak,
        next.unlockedElements
      );
      saveData(next);
      setAppState(computed);
      return next;
    });

    // Brief fade transition before returning to world
    setTransitioning(true);
    setTimeout(() => {
      setScreen('world');
      setTransitioning(false);
    }, 700);
  }, []);

  // Called after a successful import — re-reads localStorage and resets state.
  const handleImport = useCallback(() => {
    const stored = getData();
    const computed = computeAppState(stored);
    stored.currentStreak = computed.streak;
    stored.longestStreak = computed.longestStreak;
    stored.unlockedElements = checkAndUpdateUnlocks(
      stored.logs, computed.streak, computed.longestStreak, stored.unlockedElements
    );
    saveData(stored);
    setData(stored);
    setAppState(computed);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setData(prev => {
      const next = { ...prev, hasOnboarded: true };
      saveData(next);
      return next;
    });
    setShowOnboarding(false);
    setScreen('log');
  }, []);

  if (!data || !appState) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: '#0e0e0e' }}>
        <div style={{ color: '#2a2a2a', fontSize: '10px', letterSpacing: '0.4em' }}>REWILD</div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="h-full w-full">
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Screen area */}
      <div className="flex-1 relative overflow-hidden">
        {screen === 'world' && (
          <WorldScreen
            worldState={appState.worldState}
            streak={appState.streak}
            todayScore={appState.todayScore}
            todayLogged={!!appState.todayLog}
            unlockedElements={data.unlockedElements}
            onLogPrompt={() => setScreen('log')}
            transitioning={transitioning}
            earlyUser={appState.earlyUser}
            pillarAverages={appState.pillarAverages}
          />
        )}
        {screen === 'log' && (
          <LogScreen
            todayLog={appState.todayLog}
            onCommit={handleLogCommit}
            todayScore={appState.todayScore}
          />
        )}
        {screen === 'avatar' && (
          <AvatarScreen
            worldState={appState.worldState}
            streak={appState.streak}
            longestStreak={data.longestStreak}
            rollingAverage={appState.rollingAverage}
            logs={data.logs}
            unlockedElements={data.unlockedElements}
            onImport={handleImport}
          />
        )}
        {screen === 'history' && (
          <HistoryScreen
            logs={data.logs}
            rollingAverage={appState.rollingAverage}
          />
        )}
      </div>

      {/* Bottom nav */}
      <Navigation currentScreen={screen} onNavigate={setScreen} />
    </div>
  );
}
