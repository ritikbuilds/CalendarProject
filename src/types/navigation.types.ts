import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import screenStrings from '@/constants/screenStrings';

export type RootStackParamList = {
  [screenStrings.HOME]: undefined;
  [screenStrings.TASK]: { selectedDate: string }; // Pass date as YYYY-MM-DD
};

export type NavigateKey = keyof RootStackParamList;
export type screenStringsType = typeof screenStrings;

export type NavigationProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;