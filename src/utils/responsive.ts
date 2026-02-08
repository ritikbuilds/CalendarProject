import {
  moderateScale,
  moderateVerticalScale,
  scale,
  verticalScale,
} from 'react-native-size-matters';

// Horizontal scale
export const s = (size: number) => scale(size);

// Vertical scale
export const vs = (size: number) => verticalScale(size);

// Moderate horizontal scale
export const ms = (size: number, factor = 0.5) => moderateScale(size, factor);

// Moderate vertical scale
export const mvs = (size: number, factor = 0.5) => moderateVerticalScale(size, factor);
