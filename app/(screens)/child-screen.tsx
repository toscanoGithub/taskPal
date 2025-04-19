import { Dimensions, Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useUserContext } from '@/contexts/UserContext';
import { Button, Text } from '@ui-kitten/components';
import { Calendar } from 'react-native-calendars';
import { DateData, Direction, MarkedDates } from 'react-native-calendars/src/types';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task } from '@/types/Entity';
import TaskView from '../components/_child/TaskView';

// import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import db from '@/firebase/firebase-config';
import theme from "../theme.json"
import { useRouter } from 'expo-router';
import * as Device from 'expo-device';

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

  }, [tasks, user?.name]);

  

 

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
    marginVertical: 30
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
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginHorizontal: 10,
    boxShadow: "rgba(50, 50, 93, 0.25) 0px 50px 100px -10px, #4A8177 0px 30px 60px -30px",
  },
});
