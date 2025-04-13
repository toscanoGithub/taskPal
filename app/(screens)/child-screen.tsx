import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';
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




  useEffect(() => {
    const filteredTasks = tasks.filter(task => task.toFamilyMember === user?.name);

    let daysWithTasksObj: MarkedDates = {};
    let completedDays = 0;

    filteredTasks.forEach(task => {
      const taskItems = task.tasks as unknown as TaskItem[];

      const allCompleted = taskItems.every((item: TaskItem) => item.status === "Completed");

      daysWithTasksObj[task.date.dateString] = {
        selected: true,
        marked: true,
        selectedTextColor: "#14282F",
        dotColor: "#ff0000",
        selectedColor: allCompleted ? "green" : "#4A817730",
        customStyles: {
          container: {
            borderColor: "red",
            borderWidth: 4,
            borderStyle: "solid"
          }
        }
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
    setShowTask(!showTask);
  };


 

  return (
    <SafeAreaView style={styles.container}>
  
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.greetings} category="h4">Welcome, </Text>
          <Text style={styles.greetings} category="h4">{user?.name}</Text>
        </View>
        <Text style={styles.instructions} category="s2">
          Interact with the calendar below to see your tasks.
        </Text>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          theme={{ calendarBackground: "#ffffff" , dayTextColor:"black"}}
          date="2025-01-01"
          minDate={new Date().toLocaleDateString()}
          maxDate="2080-12-31"
          onDayPress={handleDayPress}
          monthFormat="yyyy MMM"
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
    </SafeAreaView>
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
    paddingVertical: 10,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  greetings: {
    fontWeight: 700,
    fontSize: 16,
    lineHeight: 24,
  },
  instructions: {
    fontSize: 16,
    fontWeight: 300,
    color: "#2B2B2B",
  },
  calendarContainer: {
    marginTop: -20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginHorizontal: 10,
    boxShadow:
      "rgba(50, 50, 93, 0.25) 0px 50px 100px -10px, #4A8177 0px 30px 60px -30px",
  },
});
