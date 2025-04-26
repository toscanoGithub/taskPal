import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import {EvaIconsPack} from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry, Layout, Text } from '@ui-kitten/components';


import { useColorScheme } from '@/hooks/useColorScheme';
import { View } from 'react-native';
import CombinedContextProvider from '@/contexts/CombinedContextProvider';
import Header from './components/Header';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  
  const [currentUser, setCurrentUser] = useState(false)

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();

      // already logged go to parent-screen >>> sure not yet so stay home
      if(currentUser) {
        router.push("/(screens)/parent-screen")
      } 
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <CombinedContextProvider>
        <ApplicationProvider {...eva} theme={eva.light}>
                <IconRegistry icons={EvaIconsPack}/>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{headerShown: false}}>
          <Stack.Screen name="(screens)/index" />
          <Stack.Screen name="(screens)/parent-screen" options={{headerShown: true, header: () => <Header />}}/>
          <Stack.Screen name="(screens)/child-screen" options={{headerShown: true, header: () => <Header />}}/>
          <Stack.Screen name="(screens)/store-screen" options={{headerShown: true, header: () => <Header />}}/>

          <Stack.Screen name="+not-found" />
        </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
        </ApplicationProvider>
    </CombinedContextProvider>

  );
}
