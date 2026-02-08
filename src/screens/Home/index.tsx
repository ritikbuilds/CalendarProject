import screenStrings from '@/constants/screenStrings';
import { getItemsByDate } from '@/db';
import AddTaskModal from '@/global/components/addTaskModal';
import { navigate } from '@/navigation/navigationUtils';
import type { CalendarItem } from '@/types/db.types';
import { dayNames, getDaysForCalendarGrid } from '@/utils/helpers';
import { theme } from '@/utils/theme';
import { fontSizes } from '@/utils/typography';
import { ms, mvs } from '@/utils/responsive';
import { useFocusEffect } from '@react-navigation/native';
import {
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  subMonths,
} from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type TaskType = 'task' | 'event';

type FABButtonProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

type DayCellProps = {
  day: Date;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  currentMonth: Date;
  dateItems: Record<string, CalendarItem[]>;
};

type HeaderProps = {
  currentMonth: Date;
};

type FloationActionButtonsProps = {
  onTaskPress: () => void;
  onEventPress: () => void;
};

const Header = ({ currentMonth }: HeaderProps) => {
  return (
    <View style={styles.header}>
      <Text style={styles.monthYearText}>
        {format(currentMonth, 'MMMM yyyy')}
      </Text>
    </View>
  );
};
const FABButton = ({ isOpen, setIsOpen }: FABButtonProps) => {
  const toggleFab = () => {
    setIsOpen(!isOpen);
  };

  return (
    <TouchableOpacity style={[styles.fab, styles.fabMain]} onPress={toggleFab}>
      <MaterialCommunityIcons
        name={isOpen ? 'close' : 'plus'}
        size={ms(28)}
        color={theme.colors.white}
      />
    </TouchableOpacity>
  );
};

const FloationActionButtons = ({
  onTaskPress,
  onEventPress,
}: FloationActionButtonsProps) => {
  return (
    <>
      <TouchableOpacity
        style={[styles.fab, styles.fabTask]}
        onPress={onTaskPress}
      >
        <MaterialCommunityIcons
          name="checkbox-marked-circle-outline"
          size={ms(20)}
          color={theme.colors.white}
          style={styles.fabIcon}
        />
        <Text style={styles.fabLabel}>Task</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fab, styles.fabEvent]}
        onPress={onEventPress}
      >
        <MaterialCommunityIcons
          name="calendar-month"
          size={ms(20)}
          color={theme.colors.white}
          style={styles.fabIcon}
        />
        <Text style={styles.fabLabel}>Event</Text>
      </TouchableOpacity>
    </>
  );
};

const DayCell = ({
  day,
  selectedDate,
  setSelectedDate,
  currentMonth,
  dateItems,
}: DayCellProps) => {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isTodayDate = isToday(day);
  const isSelected = isSameDay(day, selectedDate);
  const dateKey = format(day, 'yyyy-MM-dd');
  const items = dateItems[dateKey] || [];

  return (
    <TouchableOpacity
      style={[styles.dayCell]}
      onPress={() => {
        setSelectedDate(day);
        if (items.length > 0) {
          navigate(screenStrings.TASK, { selectedDate: dateKey });
        }
      }}
    >
      <View style={styles.dayCellContent}>
        <Text
          style={[
            styles.dayText,
            !isCurrentMonth && styles.otherMonthText,
            isTodayDate && styles.todayText,
          ]}
        >
          {format(day, 'd')}
        </Text>
        {isTodayDate && <View style={styles.todayDot} />}

        {/* Display truncated event/task titles */}
        {items.length > 0 && (
          <View style={styles.itemsContainer}>
            {items.slice(0, 2).map(item => (
              <Text
                key={`${dateKey}-${item.id}`}
                style={[
                  styles.itemText,
                  !isCurrentMonth && styles.itemTextOtherMonth,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.title}
              </Text>
            ))}
            {items.length > 2 && (
              <Text style={[styles.moreItemsText]}>+{items.length - 2}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const Home = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFabOpen, setIsFabOpen] = useState(false);
  const days = getDaysForCalendarGrid(currentMonth);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskType, setTaskType] = useState<TaskType>('task');
  const [dateItems, setDateItems] = useState<Record<string, CalendarItem[]>>(
    {},
  );
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh data when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, []),
  );

  // Load items for all visible dates
  useEffect(() => {
    const loadItemsForDates = async () => {
      const itemsByDate: Record<string, CalendarItem[]> = {};

      for (const day of days) {
        const dateKey = format(day, 'yyyy-MM-dd');
        try {
          const items = await getItemsByDate(dateKey);
          if (items.length > 0) {
            itemsByDate[dateKey] = items;
          }
        } catch (error) {
          console.error('Error loading items for date:', dateKey, error);
        }
      }

      setDateItems(itemsByDate);
    };

    loadItemsForDates();
  }, [currentMonth, showTaskModal, refreshKey]); // Reload when month changes, modal closes, or screen focused

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => subMonths(prev, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => addMonths(prev, 1));
  }, []);

  const handleGesture = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationX < -50) {
        goToNextMonth();
      } else if (nativeEvent.translationX > 50) {
        goToPreviousMonth();
      }
    }
  };

  const handleTaskPress = useCallback(() => {
    setShowTaskModal(true);
    setTaskType('task');
    setIsFabOpen(false);
  }, []);

  const handleEventPress = useCallback(() => {
    setShowTaskModal(true);
    setTaskType('event');
    setIsFabOpen(false);
  }, []);

  const renderDayNames = () => {
    return (
      <View style={styles.dayNamesRow}>
        {dayNames.map((day, index) => (
          <View key={index} style={styles.dayNameCell}>
            <Text style={styles.dayNameText}>{day}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <>
      <PanGestureHandler onHandlerStateChange={handleGesture}>
        <View style={styles.container}>
          {/* Month Navigation Header */}
          <Header currentMonth={currentMonth} />

          {/* Day Names */}
          {renderDayNames()}

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {days.map((day, index) => {
              return (
                <DayCell
                  key={index}
                  day={day}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  currentMonth={currentMonth}
                  dateItems={dateItems}
                />
              );
            })}
          </View>

          {/* Floating Action Buttons */}
          {isFabOpen && (
            <FloationActionButtons
              onEventPress={handleEventPress}
              onTaskPress={handleTaskPress}
            />
          )}

          {/* Main FAB */}
          <FABButton isOpen={isFabOpen} setIsOpen={setIsFabOpen} />
        </View>
      </PanGestureHandler>
      <AddTaskModal
        visible={showTaskModal}
        setVisible={setShowTaskModal}
        taskType={taskType}
      />
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ms(20),
    paddingVertical: mvs(15),
    // borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  monthYearText: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: theme.colors.darkGray,
  },
  dayNamesRow: {
    flexDirection: 'row',
    paddingVertical: mvs(10),
    backgroundColor: theme.colors.white,
    borderBottomWidth: ms(1),
    borderBottomColor: theme.colors.border,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: ms(0.5),
    borderRightColor: theme.colors.border,
  },
  dayNameText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.mediumGray,
  },
  calendarGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7 days
    height: '16.66%', // 100% / 6 rows
    borderWidth: ms(0.5),
    borderColor: theme.colors.border,
    padding: ms(4),
  },
  dayCellContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  dayText: {
    fontSize: ms(16),
    color: theme.colors.darkGray,
    fontWeight: '500',
  },
  otherMonthText: {
    color: '#ccc',
  },
  selectedText: {
    color: theme.colors.white,
    fontWeight: '700',
  },
  todayText: {
    backgroundColor: theme.colors.blue,
    color: theme.colors.white,
    padding: ms(8),
    borderRadius: ms(15),
    fontWeight: '600',
  },
  todayDot: {
    width: ms(4),
    height: ms(4),
    borderRadius: ms(2),
    backgroundColor: theme.colors.blue,
    marginTop: mvs(2),
  },
  itemsContainer: {
    marginTop: mvs(2),
    width: '100%',
    alignItems: 'center',
  },
  itemText: {
    fontSize: ms(9),
    color: theme.colors.darkGray,
    backgroundColor: '#e3f2fd',
    paddingHorizontal: ms(2),
    paddingVertical: mvs(1),
    borderRadius: ms(2),
    marginTop: mvs(1),
    width: '100%',
    textAlign: 'center',
  },
  eventItemText: {
    backgroundColor: '#fff3e0',
  },
  itemTextSelected: {
    color: theme.colors.white,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  itemTextOtherMonth: {
    opacity: 0.5,
  },
  moreItemsText: {
    fontSize: ms(8),
    color: theme.colors.mediumGray,
    marginTop: mvs(1),
  },
  fab: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: ms(2) },
    shadowOpacity: 0.25,
    shadowRadius: ms(3.84),
  },
  fabMain: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(16),
    backgroundColor: theme.colors.blue,
    bottom: mvs(20),
    right: ms(20),
  },
  fabMainIcon: {
    color: theme.colors.white,
  },
  fabTask: {
    flexDirection: 'row',
    paddingHorizontal: ms(16),
    height: ms(48),
    borderRadius: ms(25),
    backgroundColor: theme.colors.blue,
    bottom: mvs(90),
    right: ms(20),
  },
  fabEvent: {
    flexDirection: 'row',
    paddingHorizontal: ms(16),
    height: ms(48),
    borderRadius: ms(24),
    backgroundColor: theme.colors.blue,
    bottom: mvs(150),
    right: ms(20),
  },
  fabIcon: {
    fontSize: ms(20),
    color: theme.colors.white,
    marginRight: ms(8),
  },
  fabLabel: {
    fontSize: ms(16),
    color: theme.colors.white,
    fontWeight: '600',
  },
});
