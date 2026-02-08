// Repeat frequency types
export type RepeatFrequency = 'none' | 'daily' | 'weekly';

// Task type - single day only
export type Task = {
  type: 'task';
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  startTime?: string; // Time string (HH:MM)
  repeatFrequency: RepeatFrequency;
  notificationId?: string;
  createdAt: string;
  updatedAt: string;
};

// Event type - can span multiple days
export type CalendarEvent = {
  type: 'event';
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  startTime?: string; // Time string (HH:MM)
  endDate?: string; // ISO date string (YYYY-MM-DD) - for multi-day events
  endTime?: string; // Time string (HH:MM)
  repeatFrequency: RepeatFrequency;
  notificationId?: string;
  createdAt: string;
  updatedAt: string;
};

// Union type for database operations
export type CalendarItem = Task | CalendarEvent;