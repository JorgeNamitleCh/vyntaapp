import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ToastContainer } from './src/components/ToastContainer';
import { ThemeProvider } from './src/theme/ThemeContext';
import { notificationsService } from './src/services/notifications.service';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    notificationsService.setup().catch(() => {});
    const unsub = notificationsService.setupForegroundHandler();
    return unsub;
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <ToastContainer />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
