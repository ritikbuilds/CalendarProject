import { useKeyboard } from '@/global/contexts/KeyboardProvider';
import { KeyboardAvoidingView, StyleSheet } from 'react-native';
import { AppStack } from './Stacks';
import { SafeAreaView } from 'react-native-safe-area-context';

const RootNavigator = () => {
  const { keyboardOffset } = useKeyboard();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={undefined}
        style={[styles.container, { marginBottom: keyboardOffset }]}
      >
        <AppStack />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RootNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
