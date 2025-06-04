import { Stack } from 'expo-router';
import '../global.css';
import { StatusBar } from 'react-native';
import { RecentMoviesProvider } from '@/context/RecentMoviesContext';

export default function App() {
  return (
    <RecentMoviesProvider>
      <YourRootComponent />
    </RecentMoviesProvider>
  );
}

export default function RootLayout() {
    return (
        <>
            <StatusBar hidden={true} />

            <Stack>
                <Stack.Screen
                    name="(tabs)"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="movie/[id]"
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack>
        </>
    );
}
