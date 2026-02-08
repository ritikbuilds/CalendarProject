import Toast from 'react-native-simple-toast';

export const showToast = (message: string, duration: number = Toast.LONG) => {
  Toast.show(message, duration);
};

// Export Toast constants for custom usage
export const ToastDuration = {
  SHORT: Toast.SHORT,
  LONG: Toast.LONG,
};

export const ToastGravity = {
  TOP: Toast.TOP,
  BOTTOM: Toast.BOTTOM,
  CENTER: Toast.CENTER,
};

export default {
  show: showToast,
  Duration: ToastDuration,
  Gravity: ToastGravity,
};
