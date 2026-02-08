import notifee, { AndroidImportance } from '@notifee/react-native';

export async function createNotificationChannels() {
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
}