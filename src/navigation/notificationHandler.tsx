import { useEffect } from 'react';
import { createNotificationChannels } from '@/notifications/channels';
import { requestNotificationPermission } from '@/notifications/permissions';
import { registerNotifeeHandlers } from '@/notifications/notifee';

const NotificationHandler = () => {
  useEffect(() => {
    createNotificationChannels();
    requestNotificationPermission();
    registerNotifeeHandlers();
  }, []);
}

export default NotificationHandler;