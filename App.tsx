import { useEffect, useState } from 'react';
import { Linking, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Global safety ceiling: honor the reader's Dynamic Type setting (this is a
// reading app for older eyes) but never let text scale so far that fixed
// layouts collapse. Reading prose opts into a higher cap locally; chrome
// (menus, headers, labels) caps tighter at its own call sites.
type TextWithDefaults = typeof Text & { defaultProps?: { maxFontSizeMultiplier?: number } };
const T = Text as TextWithDefaults;
T.defaultProps = { ...T.defaultProps, maxFontSizeMultiplier: 1.6 };
import TitleScreen from './src/screens/TitleScreen';
import StoryScreen from './src/screens/StoryScreen';
import DailySignalScreen from './src/screens/DailySignalScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import GalleryScreen from './src/screens/GalleryScreen';
import { getProgress, isDaySolved, listSolvedDays } from './src/db';
import { currentStreak, dayKeyFromMs } from './src/models';
import { initPurchases } from './src/proAccess';
import { initAudio, setStaticLevel } from './src/audio';
import { BROADCAST_ONE } from './src/chapters/broadcast1';

type Screen = 'title' | 'story' | 'daily' | 'settings' | 'gallery';

const SCREENS: Screen[] = ['title', 'story', 'daily', 'settings', 'gallery'];

function Root() {
  const [screen, setScreen] = useState<Screen>('title');
  const back = () => setScreen('title');

  // numbernine://screen/<name> — used by the layout audit (and future
  // notification taps). The gallery screen is ONLY reachable this way.
  useEffect(() => {
    const handle = (url: string | null) => {
      const name = url?.match(/screen\/(\w+)/)?.[1] as Screen | undefined;
      if (name && SCREENS.includes(name)) setScreen(name);
    };
    Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener('url', (e) => handle(e.url));
    return () => sub.remove();
  }, []);

  if (screen === 'gallery') return <GalleryScreen onBack={back} />;
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
