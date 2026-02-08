import { ms } from '@/utils/responsive';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { isAndroid, isIOS } from '@/utils/helpers';
import { fontSizes } from '@/utils/typography';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '@/utils/theme';

type CustomDatePickerProps = {
  value: Date | undefined;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  mandatory?: boolean;
};

const CustomDatePicker = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  error,
  disabled = false,
  mode = 'date',
  minimumDate,
  maximumDate,
  mandatory = false,
}: CustomDatePickerProps) => {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';

    if (mode === 'date') {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } else if (mode === 'time') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return `${date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })} ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (isAndroid) {
      setShow(false);
      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate);
      }
    } else {
      // iOS - just update temp date
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setShow(false);
  };

  const handleCancel = () => {
    setTempDate(value || new Date());
    setShow(false);
  };

  const renderIOSPicker = () => (
    <Modal transparent animationType="slide" visible={show} onRequestClose={handleCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancel} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.modalButton}>
              <Text style={[styles.modalButtonText, styles.confirmButtonText]}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={tempDate}
            mode={mode}
            display="spinner"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            textColor={theme.colors.black}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {mandatory ? (
        <Text style={styles.label}>
          {label} <Text style={{ color: 'red' }}>*</Text>
        </Text>
      ) : (
        label && <Text style={styles.label}>{label}</Text>
      )}
      <TouchableOpacity
        style={[
          styles.dateInput,
          error && styles.dateInputError,
          disabled && styles.dateInputDisabled,
        ]}
        onPress={() => !disabled && setShow(true)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <MaterialCommunityIcons name={mode === 'date' ? 'calendar' : 'clock'} style={styles.dateIcon} size={24} />
        <Text style={[styles.dateText, !value && styles.placeholderText]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Text style={styles.chevronText}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {isIOS
        ? renderIOSPicker()
        : show && (
            <DateTimePicker
              value={value || new Date()}
              mode={mode}
              display="default"
              onChange={handleChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          )}
    </View>
  );
};

export default CustomDatePicker;

const styles = StyleSheet.create({
  container: {
    marginBottom: ms(16),
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: theme.colors.darkGray,
    marginBottom: ms(8),
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(16),
    paddingVertical: ms(14),
    backgroundColor: '#F8F9FA',
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: ms(12),
  },
  dateInputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  dateInputDisabled: {
    backgroundColor: '#F0F0F0',
    opacity: 0.6,
  },
  iconText: {
    fontSize: ms(20),
  },
  dateText: {
    flex: 1,
    fontSize: fontSizes.md,
    color: theme.colors.darkGray,
  },
  placeholderText: {
    color: theme.colors.lightGray,
  },
  chevronText: {
    fontSize: ms(12),
    color: theme.colors.mediumGray,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: '#FF3B30',
    marginTop: ms(4),
    marginLeft: ms(4),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: ms(20),
    borderTopRightRadius: ms(20),
    paddingBottom: ms(34),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: ms(20),
    paddingVertical: ms(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalButton: {
    padding: ms(8),
  },
  modalButtonText: {
    fontSize: fontSizes.lg,
    color: theme.colors.mediumGray,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: theme.colors.blue,
  },
  dateIcon: {
    color: theme.colors.mediumGray
  }
});
