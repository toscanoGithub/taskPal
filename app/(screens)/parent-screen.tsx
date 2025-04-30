import { ImageProps, Platform, SafeAreaView, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Text, Button,  Icon, IconElement, Layout, Spinner, TabBar, Tab } from '@ui-kitten/components'
import theme from '../theme.json'
import CalendarTab from '../components/_parent/CalendarTab'
import TasksTab from '../components/_parent/TasksTab'
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useUserContext } from '@/contexts/UserContext'
import { doc, updateDoc } from 'firebase/firestore';
import db from '@/firebase/firebase-config';
import { useTaskContext } from '@/contexts/TaskContext'
import StoreScreen from './store-screen'


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
});

const ParentScreen = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isTablet = Device.deviceType === Device.DeviceType.TABLET;
  const [expoPushToken, setExpoPushToken] = useState('');
  const { user, setUser, updateUser } = useUserContext();  // Using user context
  const [notifiiedFromFamilyMemeber, setNotifiiedFromFamilyMemeber] = useState("")
  const {fetchTasks} = useTaskContext()



  // Fetch tasks when notified from family member
  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync()
      .then(async (token) => {
        setExpoPushToken(token ?? '')
        setUser((prev) => {
          if (prev) {
            // If prev is not null, just update the pushToken field
            return { ...prev, parentPushToken: token };
          } else {
            // If prev is null, return a full AuthUser object
            return {
              id: "", // Provide a default value or leave it empty
              email: "",
              name: "", // Provide a default value
              parentPushToken: token, // Include the new pushToken
              isFamilyMember: false, // Default value or based on your logic
              members: [], // Empty array or default members
            };
          }
        });

        // Firestore users
        const docRef = doc(db, 'users', user?.id ?? 'userid');
        await updateDoc(docRef, { parentPushToken: token });
      })
      .catch((error: any) => alert(error));

    // Add listener for notification when received
    const notificationSubscription = Notifications.addNotificationReceivedListener(notification => {
      // alert(`Notification received: ${notification.request.content.data.familyMember}`);
      setNotifiiedFromFamilyMemeber(notification.request.content.data.name)

    });

    // Clean up the listener when component unmounts
    return () => {
      notificationSubscription.remove();
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Permission not granted to get push token for push notification!');
        return;
      }
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        alert('Project ID not found');
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log("Parent pushTokenString :::::::::::", pushTokenString);

        return pushTokenString;
      } catch (e: unknown) {
        alert(`${e}`);
      }
    } else {
      alert('Must use physical device for push notifications');
    }
  };

  const tabsLayout = () => {
    switch (selectedIndex) {
      case 0:
        return <CalendarTab />;
      case 1:
        return <TasksTab parentPushToken={expoPushToken}/>
      case 2:
        return <StoreScreen />
    
      default:
        break;
    }
  }
  
  return (
    <View style={styles.container}>
      <TabBar style={{backgroundColor: "#ffffff"}} indicatorStyle={{backgroundColor: theme['gradient-to'], height: 4, marginBottom: 10,}} selectedIndex={selectedIndex} onSelect={index => setSelectedIndex(index)}>
        <Tab title={evaProps => <Text category='s1'   {...evaProps} style={{color: selectedIndex === 0 ? theme['gradient-from'] : "gray", fontSize: isTablet ? 40 : 18, paddingVertical: 10}}>Calendar</Text>} />
        <Tab title={evaProps => <Text category='s1'   {...evaProps} style={{color: selectedIndex === 1 ? theme['gradient-from'] : "gray", fontSize: isTablet ? 40 : 18, paddingVertical: 10}}>Tasks</Text>} />
        <Tab title={evaProps => <Text category='s1'   {...evaProps} style={{color: selectedIndex === 1 ? theme['gradient-from'] : "gray", fontSize: isTablet ? 40 : 18, paddingVertical: 10}}>Store</Text>} />

      </TabBar>

      <View style={styles.tabContent}>

          {tabsLayout()}
        {/* {selectedIndex === 0 ? (
          <CalendarTab  />
        ) : (
          <TasksTab parentPushToken={expoPushToken}/>
        )} */}
      </View>

    </View>
  )
}

export default ParentScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fc",
  },
  tabContent: {
    flex: 1,
    padding: 0,
  },
})