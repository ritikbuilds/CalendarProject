import { insertEvent, insertTask } from '@/db';
import {
  displayNotification,
  scheduleMultipleNotifications,
  scheduleNotification,
} from '@/notifications/notifee';
import type { CalendarEvent, RepeatFrequency, Task } from '@/types/db.types';
import {
  buildSelectedDateTime,
  getCurrentDateOnly,
  handleNotifications,
  isDateInPast,
  isIOS,
  validateNotPast,
} from '@/utils/helpers';
import { ms, vs } from '@/utils/responsive';
import { theme } from '@/utils/theme';
import { showToast } from '@/utils/toast';
import { fontSizes } from '@/utils/typography';
import { format } from 'date-fns';
import React, { useCallback, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { DatePickerModal } from 'react-native-paper-dates';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomDatePicker from './customDatePicker';
import RepeatOptionsModal from './repeatOptionsModal';

type TaskType = 'task' | 'event';

type AddTaskModalProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  taskType?: TaskType;
};

type HeaderProps = {
  onClose: () => void;
  onSave: () => void;
};

type DateRangeType = {
  startDate: Date | undefined;
  endDate: Date | undefined;
};

const INITIAL_DATE_RANGE = {
  startDate: new Date(),
  endDate: new Date(),
};

const Header = ({ onClose, onSave }: HeaderProps) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onSave} style={styles.saveButton}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const AddTaskModal = ({
  visible,
  setVisible,
  taskType = 'task',
}: AddTaskModalProps) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allDayStatus, setAllDayStatus] = useState(false);
  const [repeatValue, setRepeatValue] = useState<RepeatFrequency>('none');
  const [repeatModalVisible, setRepeatModalVisible] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<Date>(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeType>(INITIAL_DATE_RANGE);

  const getRepeatLabel = (value: RepeatFrequency) => {
    switch (value) {
      case 'none':
        return 'Does not repeat';
      case 'daily':
        return 'Every day';
      case 'weekly':
        return 'Every week';
    }
  };

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setAllDayStatus(false);
    setRepeatValue('none');
    setDate(new Date());
    setTime(new Date());
    setDateRange(INITIAL_DATE_RANGE);
  }, []);

    const handleSave = async () => {
    if (!title.trim()) {
      showToast('Please enter a title');
      return;
    }

    try {
      const now = new Date().toISOString();
      const currentDateOnly = getCurrentDateOnly();

      if (taskType === 'task') {
        const selectedDateTime = buildSelectedDateTime(
          date,
          time,
          allDayStatus
        );

        if (
          !validateNotPast(
            selectedDateTime,
            allDayStatus,
            repeatValue,
            'Cannot create task for past date/time'
          )
        ) return;

        const task: Task = {
          type: 'task',
          id: `task_${Date.now()}`,
          title: title.trim(),
          description: description.trim() || undefined,
          startDate: format(date, 'yyyy-MM-dd'),
          startTime: allDayStatus ? undefined : format(time, 'HH:mm'),
          repeatFrequency: repeatValue,
          createdAt: now,
          updatedAt: now,
        };

        await insertTask(task);

        const isToday =
          selectedDateTime.getTime() === currentDateOnly.getTime();
        const isPast = isDateInPast(selectedDateTime, allDayStatus);

        await handleNotifications({
          isAllDay: allDayStatus,
          isToday,
          isPast,
          repeat: repeatValue,
          immediate: () =>
            displayNotification({
              title,
              body: description || 'Task reminder',
              data: { taskId: task.id },
            }),
          scheduled: async () => {
            await scheduleNotification({
              title,
              description,
              date,
              time,
              isAllDay: allDayStatus,
              repeat: repeatValue,
            })
          }

        });

        showToast('Task created successfully');
      }

      else {
        if (!dateRange.startDate || !dateRange.endDate) {
          showToast('Please select date range');
          return;
        }

        const selectedStartDate = buildSelectedDateTime(
          dateRange.startDate,
          time,
          allDayStatus,
          9
        );

        if (
          !validateNotPast(
            selectedStartDate,
            allDayStatus,
            repeatValue,
            'Cannot create event for past date/time'
          )
        ) return;

        const event: CalendarEvent = {
          type: 'event',
          id: `event_${Date.now()}`,
          title: title.trim(),
          description: description.trim() || undefined,
          startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
          endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
          startTime: allDayStatus ? undefined : format(time, 'HH:mm'),
          endTime: allDayStatus ? undefined : format(time, 'HH:mm'),
          repeatFrequency: repeatValue,
          createdAt: now,
          updatedAt: now,
        };

        await insertEvent(event);

        const isToday =
          selectedStartDate.getTime() === currentDateOnly.getTime();
        const isPast = isDateInPast(selectedStartDate, allDayStatus);

        await handleNotifications({
          isAllDay: allDayStatus,
          isToday,
          isPast,
          repeat: repeatValue,
          immediate: () =>
            displayNotification({
              title,
              body: description || 'Event reminder',
              data: { eventId: event.id },
            }),
          scheduled: async () => {
             await  scheduleMultipleNotifications({
              title,
              description,
              startDate: dateRange.startDate as Date,
              endDate: dateRange.endDate as Date,
              time,
              isAllDay: allDayStatus,
              repeat: repeatValue,
            });
          }

      });

        showToast('Event created successfully');
      }

      setVisible(false);
      resetForm();
    } catch (err) {
      console.error('Error saving:', err);
      showToast('Failed to save. Please try again.');
    }
  };

  const handleClose = () => {
    resetForm();
    setVisible(false);
  };

  const getMultipleDateLabel = (dateRange: DateRangeType): string => {
    return dateRange.startDate &&
      dateRange.endDate &&
      format(dateRange.startDate, 'MMM d, yyyy') ===
        format(dateRange.endDate, 'MMM d, yyyy')
      ? format(dateRange.startDate, 'MMM d, yyyy')
      : `${format(dateRange.startDate || new Date(), 'MMM d')} - ${format(
          dateRange.endDate || new Date(),
          'MMM d, yyyy',
        )}`;
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setVisible(false);
          resetForm();
        }}
      >
        <View
          style={[styles.container, { paddingTop: isIOS ? insets.top : 5 }]}
        >
          <ScrollView>
            {/* Header */}
            <Header onClose={handleClose} onSave={handleSave} />
            {/* Title Input */}
            <TextInput
              style={styles.titleInput}
              placeholder="Add title"
              placeholderTextColor={theme.colors.lightGray}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
            {/* Description Row */}
            <View style={styles.descriptionRow}>
              <MaterialCommunityIcons
                name="text"
                size={24}
                color={theme.colors.mediumGray}
                style={styles.descriptionIcon}
              />
              <TextInput
                style={styles.descriptionInput}
                placeholder="Description"
                placeholderTextColor={theme.colors.lightGray}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            {/* All day Row */}
            <View style={styles.allDayRow}>
              <View style={styles.allDayLabel}>
                <MaterialCommunityIcons
                  name="timer"
                  size={24}
                  color={theme.colors.mediumGray}
                  style={styles.descriptionIcon}
                />
                <Text>All-day</Text>
              </View>
              <Switch
                value={allDayStatus}
                onChange={() => setAllDayStatus(!allDayStatus)}
                trackColor={{ false: theme.colors.border }}
              />
            </View>

            {/* Repeat Row */}
            <TouchableOpacity
              style={styles.allDayRow}
              onPress={() => setRepeatModalVisible(true)}
            >
              <View style={styles.allDayLabel}>
                <MaterialCommunityIcons
                  name={repeatValue !== 'none' ? 'repeat' : 'repeat-off'}
                  size={24}
                  color={theme.colors.mediumGray}
                  style={styles.descriptionIcon}
                />
                <Text>{getRepeatLabel(repeatValue)}</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={theme.colors.lightGray}
              />
            </TouchableOpacity>

            {/* Date Picker */}
            <View style={styles.datePickerContainer}>
              {taskType === 'task' ? (
                <CustomDatePicker
                  value={date}
                  onChange={setDate}
                  mode="date"
                  placeholder="Select date"
                />
              ) : (
                <TouchableOpacity
                  style={styles.multipleDateButton}
                  onPress={() => setDatePickerVisible(true)}
                >
                  <MaterialCommunityIcons
                    name="calendar-range"
                    size={20}
                    color={theme.colors.blue}
                  />
                  <Text style={styles.multipleDateButtonText}>
                    {getMultipleDateLabel(dateRange)}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={theme.colors.lightGray}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Time Picker - only show if not all day */}
            {!allDayStatus && (
              <View style={styles.datePickerContainer}>
                <CustomDatePicker
                  value={time}
                  onChange={setTime}
                  mode="time"
                  placeholder="Select time"
                />
              </View>
            )}
          </ScrollView>
        </View>
        {/* Repeat Options Modal */}
        <RepeatOptionsModal
          visible={repeatModalVisible}
          onClose={() => setRepeatModalVisible(false)}
          selectedValue={repeatValue}
          onSelect={setRepeatValue}
        />
      </Modal>
      {/* Date Range Picker Modal - only for events */}
      {taskType === 'event' && (
        <DatePickerModal
          locale="en"
          mode="range"
          visible={datePickerVisible}
          onDismiss={() => setDatePickerVisible(false)}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onConfirm={({ startDate, endDate }) => {
            setDateRange({ startDate, endDate });
            setDatePickerVisible(false);
          }}
        />
      )}
    </>
  );
};

export default AddTaskModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ms(20),
  },
  closeButton: {
    padding: ms(8),
  },
  closeIcon: {
    fontSize: fontSizes.xl,
    color: theme.colors.darkGray,
    fontWeight: '300',
  },
  saveButton: {
    padding: ms(8),
  },
  saveText: {
    fontSize: fontSizes.xl,
    color: theme.colors.blue,
    fontWeight: '600',
  },
  titleInput: {
    fontSize: ms(28),
    fontWeight: '600',
    paddingHorizontal: ms(20),
    paddingVertical: vs(20),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    color: theme.colors.darkGray,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(20),
    paddingVertical: vs(15),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  descriptionIcon: {
    fontSize: ms(24),
    marginRight: ms(15),
  },
  descriptionInput: {
    flex: 1,
    fontSize: ms(16),
    color: theme.colors.darkGray,
    paddingVertical: 0,
  },
  allDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(20),
    paddingVertical: vs(15),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    justifyContent: 'space-between',
  },
  allDayLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerContainer: {
    paddingHorizontal: ms(20),
    paddingTop: vs(15),
  },
  multipleDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(16),
    paddingVertical: vs(14),
    backgroundColor: '#F8F9FA',
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: ms(12),
  },
  multipleDateButtonText: {
    flex: 1,
    fontSize: fontSizes.md,
    color: theme.colors.darkGray,
  },
});
