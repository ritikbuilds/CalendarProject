import type { CalendarEvent, Task, CalendarItem } from '@/types/db.types';
import { format } from 'date-fns';
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export const getDB = async () => {
  return SQLite.openDatabase({
    name: 'calendar.db',
    location: 'default',
  });
};

export const initDB = async () => {
  const db = await getDB();

  // Create tasks table
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      startDate TEXT NOT NULL,
      startTime TEXT,
      repeatFrequency TEXT NOT NULL DEFAULT 'none',
      notificationId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Create events table
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      startDate TEXT NOT NULL,
      startTime TEXT,
      endDate TEXT,
      endTime TEXT,
      repeatFrequency TEXT NOT NULL DEFAULT 'none',
      notificationId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  return db;
};

// Cleanup function to delete past non-repeating tasks and events
export const cleanupPastItems = async () => {
  const db = await getDB();
  const now = new Date();
  const currentDate = format(now, 'yyyy-MM-dd'); // YYYY-MM-DD
  const currentTime = format(now, 'HH:mm'); // HH:MM

  try {
    // Delete past non-repeating tasks
    await db.executeSql(
      `DELETE FROM tasks 
       WHERE repeatFrequency = 'none' 
       AND (
         startDate < ? 
         OR (startDate = ? AND (startTime IS NULL OR startTime < ?))
       )`,
      [currentDate, currentDate, currentTime],
    );

    // Delete past non-repeating events
    await db.executeSql(
      `DELETE FROM events 
       WHERE repeatFrequency = 'none' 
       AND (
         COALESCE(endDate, startDate) < ? 
         OR (COALESCE(endDate, startDate) = ? AND (COALESCE(endTime, startTime) IS NULL OR COALESCE(endTime, startTime) < ?))
       )`,
      [currentDate, currentDate, currentTime],
    );
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

// Task operations
export const insertTask = async (task: Task) => {
  const db = await getDB();

  await db.executeSql(
    `INSERT INTO tasks (id, title, description, startDate, startTime, repeatFrequency, notificationId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.id,
      task.title,
      task.description || null,
      task.startDate,
      task.startTime || null,
      task.repeatFrequency,
      task.notificationId || null,
      task.createdAt,
      task.updatedAt,
    ],
  );
};

export const updateTask = async (task: Task) => {
  const db = await getDB();

  await db.executeSql(
    `UPDATE tasks 
     SET title = ?, description = ?, startDate = ?, startTime = ?, 
         repeatFrequency = ?, notificationId = ?, updatedAt = ?
     WHERE id = ?`,
    [
      task.title,
      task.description || null,
      task.startDate,
      task.startTime || null,
      task.repeatFrequency,
      task.notificationId || null,
      task.updatedAt,
      task.id,
    ],
  );
};

export const getAllTasks = async (): Promise<Task[]> => {
  const db = await getDB();
  const results = await db.executeSql(
    `SELECT * FROM tasks ORDER BY startDate, startTime`,
  );

  const rows = results[0].rows;
  const tasks: Task[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows.item(i);
    tasks.push({
      type: 'task',
      id: row.id,
      title: row.title,
      description: row.description,
      startDate: row.startDate,
      startTime: row.startTime,
      repeatFrequency: row.repeatFrequency,
      notificationId: row.notificationId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  return tasks;
};

export const getTasksByDate = async (date: string): Promise<Task[]> => {
  const db = await getDB();
  const results = await db.executeSql(
    `SELECT * FROM tasks WHERE startDate = ? ORDER BY startTime`,
    [date],
  );

  const rows = results[0].rows;
  const tasks: Task[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows.item(i);
    tasks.push({
      type: 'task',
      id: row.id,
      title: row.title,
      description: row.description,
      startDate: row.startDate,
      startTime: row.startTime,
      repeatFrequency: row.repeatFrequency,
      notificationId: row.notificationId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  return tasks;
};

export const deleteTask = async (id: string) => {
  const db = await getDB();
  await db.executeSql(`DELETE FROM tasks WHERE id = ?`, [id]);
};

// Event operations
export const insertEvent = async (event: CalendarEvent) => {
  const db = await getDB();

  await db.executeSql(
    `INSERT INTO events (id, title, description, startDate, startTime, endDate, endTime, repeatFrequency, notificationId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      event.id,
      event.title,
      event.description || null,
      event.startDate,
      event.startTime || null,
      event.endDate || null,
      event.endTime || null,
      event.repeatFrequency,
      event.notificationId || null,
      event.createdAt,
      event.updatedAt,
    ],
  );
};

export const updateEvent = async (event: CalendarEvent) => {
  const db = await getDB();

  await db.executeSql(
    `UPDATE events 
     SET title = ?, description = ?, startDate = ?, startTime = ?, 
         endDate = ?, endTime = ?, repeatFrequency = ?, 
         notificationId = ?, updatedAt = ?
     WHERE id = ?`,
    [
      event.title,
      event.description || null,
      event.startDate,
      event.startTime || null,
      event.endDate || null,
      event.endTime || null,
      event.repeatFrequency,
      event.notificationId || null,
      event.notificationId || null,
      event.updatedAt,
      event.id,
    ],
  );
};

export const getAllEvents = async (): Promise<CalendarEvent[]> => {
  const db = await getDB();
  const results = await db.executeSql(
    `SELECT * FROM events ORDER BY startDate, startTime`,
  );

  const rows = results[0].rows;
  const events: CalendarEvent[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows.item(i);
    events.push({
      type: 'event',
      id: row.id,
      title: row.title,
      description: row.description,
      startDate: row.startDate,
      startTime: row.startTime,
      endDate: row.endDate,
      endTime: row.endTime,
      repeatFrequency: row.repeatFrequency,
      notificationId: row.notificationId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  return events;
};

export const getEventsByDateRange = async (
  startDate: string,
  endDate: string,
): Promise<CalendarEvent[]> => {
  const db = await getDB();
  const results = await db.executeSql(
    `SELECT * FROM events 
     WHERE (startDate <= ? AND (endDate >= ? OR endDate IS NULL))
     ORDER BY startDate, startTime`,
    [endDate, startDate],
  );

  const rows = results[0].rows;
  const events: CalendarEvent[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows.item(i);
    events.push({
      type: 'event',
      id: row.id,
      title: row.title,
      description: row.description,
      startDate: row.startDate,
      startTime: row.startTime,
      endDate: row.endDate,
      endTime: row.endTime,
      repeatFrequency: row.repeatFrequency,
      notificationId: row.notificationId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  return events;
};

export const deleteEvent = async (id: string) => {
  const db = await getDB();
  await db.executeSql(`DELETE FROM events WHERE id = ?`, [id]);
};

// Combined operations for calendar views
export const getItemsByDate = async (date: string): Promise<CalendarItem[]> => {
  const tasks = await getTasksByDate(date);
  const events = await getEventsByDateRange(date, date);

  return [...tasks, ...events].sort((a, b) => {
    const timeA = a.startTime || '00:00';
    const timeB = b.startTime || '00:00';
    return timeA.localeCompare(timeB);
  });
};
