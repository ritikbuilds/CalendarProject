import screenStrings from '@/constants/screenStrings';
import { deleteEvent, deleteTask, getItemsByDate } from '@/db';
import { goBack } from '@/navigation/navigationUtils';
import { cancelScheduledNotification } from '@/notifications/notifee';
import type { CalendarItem } from '@/types/db.types';
import type { NavigationProps } from '@/types/navigation.types';
import { ms, mvs } from '@/utils/responsive';
import { theme } from '@/utils/theme';
import { showToast } from '@/utils/toast';
import { fontSizes } from '@/utils/typography';
import { format, parse } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type TaskScreenProps = NavigationProps<typeof screenStrings.TASK>;

type HeaderProps = {
  onClose: () => void;
};

const Header = ({ onClose }: HeaderProps) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <MaterialCommunityIcons
          name="arrow-left"
          size={28}
          color={theme.colors.darkGray}
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Tasks & Events</Text>
      <View style={styles.closeButton} />
    </View>
  );
};

const Task = ({ route }: TaskScreenProps) => {
  const { selectedDate } = route.params;
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [selectedDate]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const fetchedItems = await getItemsByDate(selectedDate);
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error loading items:', error);
      showToast('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item: CalendarItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Cancel notification if exists
              if (item.notificationId) {
                await cancelScheduledNotification(item.notificationId);
              }

              // Delete from database
              if (item.type === 'task') {
                await deleteTask(item.id);
              } else {
                await deleteEvent(item.id);
              }

              showToast('Deleted successfully');
              await loadItems(); // Reload the list

              // Check if list is now empty and go back
              const updatedItems = await getItemsByDate(selectedDate);
              if (updatedItems.length === 0) {
                goBack();
              }
            } catch (error) {
              console.error('Error deleting item:', error);
              showToast('Failed to delete');
            }
          },
        },
      ],
    );
  };

  const handleClose = () => {
    goBack();
  };

  const renderItem = ({ item }: { item: CalendarItem }) => {
    const isEvent = item.type === 'event';
    const timeDisplay = item.startTime
      ? format(parse(item.startTime, 'HH:mm', new Date()), 'h:mm a')
      : 'All day';

    return (
      <View style={[styles.itemCard, isEvent && styles.eventCard]}>
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <View style={styles.itemTypeIndicator}>
              <MaterialCommunityIcons
                name={isEvent ? 'calendar' : 'checkbox-marked-circle-outline'}
                size={20}
                color={theme.colors.blue}
              />
              <Text style={styles.itemType}>{isEvent ? 'Event' : 'Task'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={styles.deleteButton}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color="#F44336"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.itemTitle}>{item.title}</Text>

          {item.description && (
            <Text style={styles.itemDescription}>{item.description}</Text>
          )}

          <View style={styles.itemFooter}>
            <View style={styles.timeContainer}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color={theme.colors.mediumGray}
              />
              <Text style={styles.timeText}>{timeDisplay}</Text>
            </View>

            {item.repeatFrequency !== 'none' && (
              <View style={styles.repeatContainer}>
                <MaterialCommunityIcons
                  name="repeat"
                  size={16}
                  color={theme.colors.mediumGray}
                />
                <Text style={styles.repeatText}>
                  {item.repeatFrequency === 'daily' ? 'Daily' : 'Weekly'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const dateObj = parse(selectedDate, 'yyyy-MM-dd', new Date());
  const formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy');

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header onClose={handleClose} />

      {/* Date Display */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>

      {/* Items List */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="calendar-blank-outline"
            size={64}
            color="#ccc"
          />
          <Text style={styles.emptyText}>No tasks or events for this day</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

export default Task;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ms(20),
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: ms(8),
    width: ms(44),
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: theme.colors.darkGray,
  },
  dateContainer: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: ms(20),
    paddingVertical: mvs(15),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dateText: {
    fontSize: fontSizes.md,
    color: theme.colors.mediumGray,
    fontWeight: '500',
  },
  listContent: {
    padding: ms(16),
  },
  itemCard: {
    backgroundColor: theme.colors.white,
    borderRadius: ms(12),
    padding: ms(16),
    marginBottom: mvs(12),
    borderLeftWidth: ms(4),
    borderLeftColor: theme.colors.blue,
    elevation: 2,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: ms(1) },
    shadowOpacity: 0.1,
    shadowRadius: ms(2),
  },
  eventCard: {
    borderLeftColor: theme.colors.blue,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: mvs(8),
  },
  itemTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
  },
  itemType: {
    fontSize: fontSizes.sm,
    color: theme.colors.mediumGray,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  deleteButton: {
    padding: ms(4),
  },
  itemTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.darkGray,
    marginBottom: 6,
  },
  itemDescription: {
    fontSize: fontSizes.md,
    color: theme.colors.mediumGray,
    marginBottom: mvs(12),
    lineHeight: ms(20),
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(16),
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
  },
  timeText: {
    fontSize: fontSizes.sm,
    color: theme.colors.mediumGray,
  },
  repeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
  },
  repeatText: {
    fontSize: fontSizes.sm,
    color: theme.colors.mediumGray,
  },
  dateRangeText: {
    fontSize: fontSizes.sm,
    color: theme.colors.lightGray,
    marginTop: mvs(6),
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ms(32),
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: theme.colors.lightGray,
    marginTop: mvs(16),
    textAlign: 'center',
  },
});
