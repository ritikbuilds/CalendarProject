import { KeyboardProvider } from '@/global/contexts/KeyboardProvider';
import { navigationRef } from '@/navigation/navigationUtils';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './RootNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NotificationHandler from '@/notifications/notificationHandler';

const AppNavigation = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <KeyboardProvider>
            <NotificationHandler />
            <RootNavigator />
          </KeyboardProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
};

export default AppNavigation;
