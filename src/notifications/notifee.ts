import notifee, {
  AlarmType,
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  EventType,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { eachDayOfInterval } from 'date-fns';
import { createNotificationChannels } from './channels';

type RepeatType = 'none' | 'daily' | 'weekly';

type notificationData = {
  title: string;
  description: string;
  date: Date;
  time: Date;
  isAllDay?: boolean;
  repeat?: RepeatType;
  taskId?: string;
};

type MultipleNotificationData = {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  time: Date;
  isAllDay?: boolean;
  repeat?: RepeatType;
  taskId?: string;
};

type ScheduleParams = {
  date: Date;
  time?: Date; // optional
  isAllDay: boolean;
};

// If user selects isAllDay then we'll show notification at 9 AM on the selected date. Otherwise, we'll use the selected time.

export function getNotificationDateTime({
  date,
  time,
  isAllDay,
}: ScheduleParams): Date {
  if (isAllDay) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      9,
      0,
      0,
    );
  }

  // Date + time selected
  if (!time) {
    throw new Error('Time is required when all-day is off');
  }

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
    0,
  );
}

export async function displayNotification({
  title,
  body,
  data,
}: {
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId: 'default',
      pressAction: { id: 'default' },
    },
  });
}

export function registerNotifeeHandlers() {
  notifee.onForegroundEvent(async ({ type }) => {
    if (type === EventType.PRESS) {
    }
  });
}

export async function notifeeBackgroundHandler({ type }: { type: EventType }) {
  if (type === EventType.PRESS) {
  }
}

export async function scheduleNotification({
  title,
  description,
  date,
  time,
  repeat = 'none',
  taskId,
}: notificationData): Promise<string[]> {
  const notificationDate = new Date(date);
  const notificationTime = new Date(time);

  await createNotificationChannels();

  const notificationIds: string[] = [];

  const notificationTimestamp = notificationDate.setHours(
    notificationTime.getHours(),
    notificationTime.getMinutes(),
    0,
    0,
  );

  const repeatFreq = getRepeatFrequency(repeat);
  
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: notificationTimestamp,
    repeatFrequency: repeatFreq,
    alarmManager: {
      type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
    },
  };

  const notificationId = await notifee.createTriggerNotification(
    {
      title,
      body: description,
      data: {
        repeat,
        taskId: taskId || '',
      },
      android: {
        channelId: 'default',
        category: AndroidCategory.REMINDER,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        sound: 'Default',
        autoCancel: repeat === 'none',
      },
    },
    trigger,
  );
  
  notificationIds.push(notificationId);
  return notificationIds;
}

function getRepeatFrequency(repeat: RepeatType): RepeatFrequency | undefined {
  switch (repeat) {
    case 'daily':
      return RepeatFrequency.DAILY;
    case 'weekly':
      return RepeatFrequency.WEEKLY;
    case 'none':
      return undefined;
    default:
      return undefined;
  }
}

export async function scheduleMultipleNotifications({
  title,
  description,
  startDate,
  endDate,
  time,
  isAllDay = false,
  repeat = 'none',
  taskId,
}: MultipleNotificationData): Promise<string[]> {
  await createNotificationChannels();

  const datesInRange = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const notificationIds: string[] = [];

  for (const date of datesInRange) {
    const notificationTime = new Date(time);
    
    const notificationTimestamp = new Date(date).setHours(
      isAllDay ? 9 : notificationTime.getHours(),
      isAllDay ? 0 : notificationTime.getMinutes(),
      0,
      0,
    );

    const repeatFreq = getRepeatFrequency(repeat);
    
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: notificationTimestamp,
      repeatFrequency: repeatFreq,
      alarmManager: {
        type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
      },
    };

    const notificationId = await notifee.createTriggerNotification(
      {
        title,
        body: description,
        data: {
          repeat,
          taskId: taskId || '',
        },
        android: {
          channelId: 'default',
          category: AndroidCategory.EVENT,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
          sound: 'Default',
          autoCancel: repeat === 'none',
        },
      },
      trigger,
    );

    notificationIds.push(notificationId);
  }

  return notificationIds;
}

export async function cancelScheduledNotification(notificationId: string) {
  try {
    await notifee.cancelNotification(notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
    throw error;
  }
}

export async function cancelAllNotifications() {
  try {
    await notifee.cancelAllNotifications();
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
    throw error;
  }
}
