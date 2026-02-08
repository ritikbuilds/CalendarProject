import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import React from 'react';
import { fontSizes } from '@/utils/typography';
import { ms, vs } from '@/utils/responsive';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { RepeatFrequency } from '@/types/db.types';
import { theme } from '@/utils/theme';

type RepeatOption = {
  label: string;
  value: RepeatFrequency;
};

const repeatOptions: RepeatOption[] = [
  { label: 'Does not repeat', value: 'none' },
  { label: 'Every day', value: 'daily' },
  { label: 'Every week', value: 'weekly' },
];

type RepeatOptionsModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedValue: string;
  onSelect: (value: RepeatFrequency) => void;
};

type RepeatOptionProps = {
  option: RepeatOption;
  onSelect: (value: RepeatFrequency) => void;
  selectedValue: string;
  isLastOption: boolean;
};

const RepeatOption = ({
  option,
  onSelect,
  selectedValue,
  isLastOption,
}: RepeatOptionProps) => {
  return (
    <TouchableOpacity
      key={option.value}
      style={[styles.optionItem, isLastOption && styles.lastOption]}
      onPress={() => onSelect(option.value)}
    >
      <Text
        style={[
          styles.optionText,
          selectedValue === option.value && styles.selectedText,
        ]}
      >
        {option.label}
      </Text>
      {selectedValue === option.value && (
        <MaterialCommunityIcons name="check" size={24} color={theme.colors.blue} />
      )}
    </TouchableOpacity>
  );
};

const Header = ({ onClose }: Pick<RepeatOptionsModalProps, 'onClose'>) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Repeat</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <MaterialCommunityIcons name="close" size={24} color={theme.colors.darkGray} />
      </TouchableOpacity>
    </View>
  );
};

const RepeatOptionsModal = ({
  visible,
  onClose,
  selectedValue,
  onSelect,
}: RepeatOptionsModalProps) => {
  const handleSelect = (value: RepeatFrequency) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.modalContent}>
              {/* Header */}
              <Header onClose={onClose} />
              {/* Options List */}
              <ScrollView style={styles.optionsList}>
                {repeatOptions.map((option, index) => (
                  <RepeatOption
                    key={index}
                    option={option}
                    onSelect={handleSelect}
                    selectedValue={selectedValue}
                    isLastOption={index === repeatOptions.length - 1}
                  />
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default RepeatOptionsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    justifyContent: 'center',
    width: '90%',
    maxHeight: '70%',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: ms(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ms(20),
    paddingVertical: vs(14),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: theme.colors.darkGray,
  },
  closeButton: {
    padding: ms(4),
  },
  optionsList: {
    paddingVertical: vs(8),
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ms(20),
    paddingVertical: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: fontSizes.lg,
    color: theme.colors.darkGray,
  },
  selectedText: {
    color: theme.colors.blue,
    fontWeight: '600',
  },
});
