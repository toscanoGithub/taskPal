import { Alert, Dimensions, Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useUserContext } from '@/contexts/UserContext';
import { Button, Text } from '@ui-kitten/components';
import { Calendar } from 'react-native-calendars';
import { DateData, Direction, MarkedDates } from 'react-native-calendars/src/types';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task } from '@/types/Entity';
import TaskView from '../components/_child/TaskView';

// import * as Device from 'expo-device';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import db from '@/firebase/firebase-config';
import theme from "../theme.json"
import { useRouter } from 'expo-router';
import CalendarLegend from '../components/calendar-legend';
import BoxMessage from '../components/BoxMessage';

interface TaskItem {
  description: string;
  id: string;
  status: string;
}

const ChildScreen = () => {
  const { tasks } = useTaskContext();
  const { user, setUser } = useUserContext();
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateData>();
  const [daysWithTasks, setDaysWithTasks] = useState<MarkedDates>({});
  const [expandedModal, setExpandedModal] = useState(false);
  const [modalType, setModalType] = useState<string>();
  const [tasksForSelectedDay, settasksForSelectedDay] = useState<TaskItem[]>([]);
  const [showTask, setShowTask] = useState(false);
  const router = useRouter()
  const isTablet = Device.deviceType === Device.DeviceType.TABLET;
  const {height} = Dimensions.get('screen');
  const [daysCompletedCount, setDaysCompletedCount] = useState(0);
  const [expoPushToken, setExpoPushToken] = useState('');

const [showBoxMessage, setShowBoxMessage] = useState(false)



  /****************** NOTIFICATIONS START *********************/

  async function sendPushNotification(expoPushToken: string) {
    const pt = user?.members?.find(u => u.name === user.name);
    console.log("::::: pt", pt);
    
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'All Tasks Completed!',
      body: `${user?.name} has completed all tasks for today.`,
      data: { ...pt },
    };
  
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  }

  useEffect(() => {
    const registerPushToken = async () => {
      const token = await registerForPushNotificationsAsync();
      if (!token) return;

      setExpoPushToken(token);

      const docRef = doc(db, 'users', user?.id ?? 'userid');

      try {
        const userDoc = await getDoc(docRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const members = userData?.members || [];

          const memberIndex = members.findIndex((member: { name: string | undefined }) => member.name === user?.name);

          if (memberIndex !== -1) {
            const currentMember = members[memberIndex];

            if (currentMember.memberPushToken !== token) {
              const updatedMember = {
                ...currentMember,
                memberPushToken: token,
              };

              const updatedMembers = [
                ...members.slice(0, memberIndex),
                updatedMember,
                ...members.slice(memberIndex + 1),
              ];

              await updateDoc(docRef, {
                members: updatedMembers,
              });

              setUser(prev => {
                if (prev) {
                  return {
                    ...prev,
                    members: updatedMembers,
                  };
                }
                return prev;
              });
              console.log('Push token updated successfully');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching or updating user document:', error);
      }
    };

    if (user?.id && user?.name) {
      registerPushToken();
    }

    // Notification received listener
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const title = notification.request.content.title;
      const body = notification.request.content.body;
    });

    // Cleanup the listener when the component unmounts
    return () => subscription.remove();
  }, [user?.id, user?.name]);



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
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        alert('Project ID not found');
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        
        
        return pushTokenString;
      } catch (e: unknown) {
        alert(`${e}`);
      }
    } else {
      alert('Must use physical device for push notifications');
    }
  };

  /****************** NOTIFICATIONS END *********************/





  useEffect(() => {
    const filteredTasks = tasks.filter(task => task.toFamilyMember === user?.name);

    let daysWithTasksObj: MarkedDates = {};
    let completedDays = 0;

    filteredTasks.forEach(task => {
      const taskItems = task.tasks as unknown as TaskItem[];

      const allCompleted = taskItems.every((item: TaskItem) => item.status === "Completed");

      daysWithTasksObj[task.date.dateString] = {
        
        customStyles: {
          container: {
            borderRadius: 999, // makes it a full circle
            width: isTablet ? 50 : 30,         // increase width
            height: isTablet ? 50 : 30,        // increase height
            alignItems: 'center',
            justifyContent: 'center',
          },
          text: {
            color: 'white',
            fontWeight: 'bold',
          },
        },
        selected: true,
        marked: true,
        dotColor: !allCompleted ? theme['gradient-to'] : "transparent",
        // selectedTextColor: "#14282F",
        selectedColor: allCompleted ? theme['gradient-to'] : theme.secondary,
      };

      if (allCompleted) {
        completedDays += 1;
      }
    });

    setDaysWithTasks(daysWithTasksObj);
    setDaysCompletedCount(completedDays);

  }, [tasks, user?.name]);

  
  useEffect(() => {
    const totalDaysWithTasks = Object.keys(daysWithTasks).length;
    console.log("Total days with tasks: ", totalDaysWithTasks);
    console.log("Days completed count: ", daysCompletedCount);
    if (  totalDaysWithTasks > 0 && daysCompletedCount === totalDaysWithTasks) {
      notifyParentWithAllDone();
    }
  }, [daysCompletedCount]);
 
  const getParentPushToken = () => {
    return user?.parentPushToken;  // Assuming parent's token is stored in user context
  };


  const notifyParentWithAllDone = async () => {
    if (expoPushToken) {
      const parentPushToken = getParentPushToken();  // Get parent's push token
      if (parentPushToken) {        
        await sendPushNotification(parentPushToken);  // Send notification to parent
      }
    }

    setShowBoxMessage(true);
  };

  const handleDayPress = (date: DateData) => {
    const filteredTasks = tasks.filter(task => task.toFamilyMember === user?.name && date.dateString === task.date.dateString);
    if(filteredTasks.length === 0) return;

    const taskItems = filteredTasks.map(task => task.tasks)[0] as unknown as TaskItem[];

    if (taskItems) {
      settasksForSelectedDay(taskItems);
    }

    setSelectedDate(date);
    setShowTask(true);
  };


 

  return (
    <View style={styles.container}>
        <BoxMessage
        visible={showBoxMessage}
        dismiss={() => setShowBoxMessage(false)}
        message="Your tasks are done! 
        The host has been notified."
        />
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[styles.greetings, {fontSize: isTablet ? 30 : 18}]} category="h2">Welcome, </Text>
          <Text style={[styles.greetings, {fontSize: isTablet ? 30 : 18}]} category="h1">{user?.name}</Text>
        </View>
        
        <Text style={[styles.instructions, {fontSize: isTablet ? 30 : 18}]} category="s2">
        Interact with the calendar below to see your tasks.
      </Text>  
        
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          markingType={'custom'}
          enableSwipeMonths={true}
          hideExtraDays={true}
          style={{  height: isTablet && height * 0.5  }}
          theme={{weekVerticalMargin: isTablet ? 40 : 5,  calendarBackground: "#ffffff", dayTextColor:"black", textDayFontWeight: 400, textDayFontSize: isTablet ? 25 : 16, textMonthFontSize: isTablet ? 30 : 18, textMonthFontWeight: 700 }}
          minDate={new Date().toISOString().split('T')[0]}
          maxDate={'2080-12-31'}
          date={new Date().toLocaleDateString()}
          
          onDayPress={handleDayPress}
          monthFormat={'yyyy MMM'}
          renderArrow={(direction: Direction) => (
            <View style={{ padding: 10 }}>
              {direction === 'left' ? <Text>◀</Text> : <Text>▶</Text>}
            </View>
          )}
          markedDates={daysWithTasks}
        />

      </View>

      <CalendarLegend />
      
      <TaskView
        dismiss={() => setShowTask(false)}
        tasksCurrentdDay={tasksForSelectedDay}
        isVisible={showTask}
        date={selectedDate}
        allDone={() => alert("All tasks are done")}
      />

      
    </View>
  );
};

export default ChildScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
    
    
  },

  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    top: "30%",
  },
  revealRewardBtn: {
    position:"absolute",
    alignSelf: "center",
    
    backgroundColor: theme['gradient-from'],
    borderRadius: 70,
    paddingHorizontal: 50,
    paddingVertical: 30,
    borderTopWidth: 0,
    borderBottomColor: theme.secondary
    
  },

  revealRewardTextBtn: {
    color: theme.secondary,
    fontSize: 24,
    textTransform: "capitalize",
    fontWeight: "300",

  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginVertical: 10
  },
  greetings: {
    fontWeight: 700,
    fontSize: 16,
  },
  instructions: {
    fontSize: 16,
    fontWeight: 300,
    color: "#2B2B2B",
  },
  calendarContainer: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginHorizontal: 10,
    boxShadow: "rgba(50, 50, 93, 0.25) 0px 50px 100px -10px, #4A8177 0px 30px 60px -50px",
  },
});
