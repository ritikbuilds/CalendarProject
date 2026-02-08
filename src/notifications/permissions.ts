import { isAndroid } from '@/utils/helpers';
import notifee from '@notifee/react-native';
import { Alert, Linking, Platform } from 'react-native';
import { canScheduleExactAlarms } from 'react-native-permissions';

export async function requestNotificationPermission() {
  return notifee.requestPermission({
    alert: true,
    sound: true,
    badge: true,
  });
}
export const requestExactAlarmPermission = async () => {
  const hasAlarmPermission = await canScheduleExactAlarms();
  if (isAndroid && !hasAlarmPermission)
  Alert.alert(
    'Exact Alarm Permission',
    'To ensure your reminders work, please grant the Exact Alarm permission. If you deny this permission, notifications may not be delivered.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          if (isAndroid && (Platform.Version as number) >= 31) {
            Linking.sendIntent('android.settings.REQUEST_SCHEDULE_EXACT_ALARM');

          }
        },
      },
    ],
    { cancelable: false },
  );
};