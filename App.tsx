import React, { useEffect } from 'react'
import AppNavigation from '@/navigation/AppNavigation'
import { requestExactAlarmPermission } from '@/notifications/permissions';
import { initDB, cleanupPastItems } from '@/db';

const App = () => {
  useEffect(() => {
    requestExactAlarmPermission();
  }, [])

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDB();
        await cleanupPastItems();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    initializeApp();
  },[])
  return (
    <AppNavigation/>
  )
}

export default App
