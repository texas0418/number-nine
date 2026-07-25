import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import TitleScreen from './src/screens/TitleScreen';
import StoryScreen from './src/screens/StoryScreen';
import DailySignalScreen from './src/screens/DailySignalScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { getProgress, isDaySolved, listSolvedDays } from './src/db';
import { currentStreak, dayKeyFromMs } from './src/models';
import { initPurchases } from './src/proAccess';
import { initAudio, setStaticLevel } from './src/audio';
import { BROADCAST_ONE } from './src/chapters/broadcast1';

type Screen = 'title' | 'story' | 'daily' | 'settings';

function Root() {
  const [screen, setScreen] = useState<Screen>('title');
  const back = () => setScreen('title');

  if (screen === 'story') return <StoryScreen onBack={back} />;
  if (screen === 'daily') return <DailySignalScreen onBack={back} />;
  if (screen === 'settings') return <SettingsScreen onBack={back} />;

  const todayKey = dayKeyFromMs(Date.now());
  const progress = getProgress(BROADCAST_ONE.id);
  return (
    <TitleScreen
      chapterOneStarted={(progress?.blockIndex ?? 0) > 0}
      chapterOneDone={progress?.completedMs != null}
      streak={currentStreak(listSolvedDays(), todayKey)}
      todaySolved={isDaySolved(todayKey)}
      onStory={() => {
        setStaticLevel(0.1);
        setScreen('story');
      }}
      onDaily={() => setScreen('daily')}
      onSettings={() => setScreen('settings')}
    />
  );
}

export default function App() {
  useEffect(() => {
    // Fail-open: unlocks the story immediately in Expo Go / placeholder builds.
    initPurchases();
    initAudio();
  }, []);
  return (
    <>
      <StatusBar style="light" />
      <Root />
    </>
  );
}
