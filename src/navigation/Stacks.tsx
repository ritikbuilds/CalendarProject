import type { RootStackParamList } from '@/types/navigation.types';
import screenStrings from '@/constants/screenStrings';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Task } from '@/screens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={screenStrings.HOME}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={screenStrings.HOME} component={Home} />
      <Stack.Screen name={screenStrings.TASK} component={Task} />
    </Stack.Navigator>
  );
};
