import {
  addDays,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Dimensions, Platform } from 'react-native';
import { showToast } from './toast';

type HandleNotificationsParams = {
  isAllDay: boolean;
  isToday: boolean;
  isPast: boolean;
  repeat: string;
  immediate: () => Promise<void>;
  scheduled: () => Promise<void>;
};

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get('window');

export const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const capitalize = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const getDaysForCalendarGrid = (month: Date): Date[] => {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });

  const days: Date[] = [];
  let curr = start;

  while (curr <= end) {
    days.push(curr);
    curr = addDays(curr, 1);
  }

  return days;
};

export const getCurrentDateOnly = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const buildSelectedDateTime = (
  date: Date,
  time: Date,
  allDay: boolean,
  allDayHour = 0,
) => {
  const d = new Date(date);
  if (allDay) {
    d.setHours(allDayHour, 0, 0, 0);
  } else {
    d.setHours(time.getHours(), time.getMinutes(), 0, 0);
  }
  return d;
};

export const isDateInPast = (selected: Date, allDay: boolean) => {
  const now = new Date();
  const today = getCurrentDateOnly();
  return allDay ? selected < today : selected < now;
};

export const validateNotPast = (
  selectedDate: Date,
  allDay: boolean,
  repeat: string,
  message: string,
) => {
  if (isDateInPast(selectedDate, allDay) && repeat === 'none') {
    showToast(message);
    return false;
  }
  return true;
};

export const handleNotifications = async ({
  isAllDay,
  isToday,
  isPast,
  repeat,
  immediate,
  scheduled,
}: HandleNotificationsParams) => {
  try {
    if (isAllDay && isToday && repeat === 'none') {
      await immediate();
    } else if (!isPast || repeat !== 'none') {
      await scheduled();
    }
  } catch (err) {
    console.error('Notification error:', err);
  }
};
