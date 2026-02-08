import { createContext, useContext, useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

const KeyboardContext = createContext({
  isKeyboardOpen: false,
  keyboardOffset: 0,
});

type KeyboardProviderProps = {
  children: React.ReactNode;
};

export const KeyboardProvider = ({ children }: KeyboardProviderProps) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', e => {
      setIsKeyboardOpen(true);
      setKeyboardOffset(e.endCoordinates?.height || 0);
    });

    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardOpen(false);
      setKeyboardOffset(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return (
    <KeyboardContext.Provider value={{ isKeyboardOpen, keyboardOffset }}>
      {children}
    </KeyboardContext.Provider>
  );
};

export const useKeyboard = () => useContext(KeyboardContext);
