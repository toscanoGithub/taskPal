import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Dimensions, StyleSheet, SafeAreaView } from 'react-native';
import Animated, { Easing, withSpring, useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { Text } from '@ui-kitten/components';
import theme from "../../theme.json";
import { useUserContext } from '@/contexts/UserContext';
import { useTaskContext } from '@/contexts/TaskContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import db from '@/firebase/firebase-config';
import { DateData } from 'react-native-calendars';
import { Task } from '@/types/Entity';


const { height, width } = Dimensions.get('screen');

interface TaskViewProps {
  isVisible: boolean;
  tasksCurrentdDay: { description: string, id: string, status: string }[];
  date?: DateData;
  allDone: () => void;
  dismiss: () => void;
}

type ButtonCenter = {
  x: number;
  y: number;
};

const TaskView: React.FC<TaskViewProps> = ({ isVisible, tasksCurrentdDay, date, allDone, dismiss }) => {
  const [confettiStates, setConfettiStates] = useState<{ [key: string]: boolean }>({});
  const [buttonCenter, setButtonCenter] = useState<ButtonCenter | null>(null);
  const { user } = useUserContext();
  const { tasks } = useTaskContext();
  const { updateTask } = useTaskContext();

  const slidePosition = useSharedValue(-height);

  const slideIn = () => {
    slidePosition.value = withSpring(0, { damping: 20, stiffness: 100 });
  };

  const slideOut = () => {
    slidePosition.value = withTiming(-height, { duration: 300, easing: Easing.ease });
    dismiss();
  };

  useEffect(() => {
    if (isVisible) {
      slideIn();
    } else {
      slideOut();
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slidePosition.value }],
  }));

  const handlePressDoneBtn = async (taskId: string) => {
    setConfettiStates(prev => ({ ...prev, [taskId]: true }));

    const q = query(collection(db, "tasks"), where("date", "==", date), where("toFamilyMember", "==", user!.name));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log("no Task registered yet");
    } else {
      querySnapshot.forEach(async (currentDoc) => {
        updateTask(currentDoc.data() as Task, taskId);
      });
    }
  };

  // Ensure confetti triggers for all tasks when they are all completed
  useEffect(() => {
    if(!isVisible) return;    
    const allTasksCompleted = tasksCurrentdDay.every(t => t.status === "Completed");
    if (allTasksCompleted) {
      const updatedConfettiStates = tasksCurrentdDay.reduce<{ [key: string]: boolean }>((acc, task) => {
        acc[task.id] = true;  // Trigger confetti for all tasks
        return acc;
      }, {});
      setConfettiStates(updatedConfettiStates);
    }
  }, [tasksCurrentdDay, isVisible]);  // Re-run whenever tasks change

  const handleLayout = (event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setButtonCenter({ x: x + width / 2, y: y + height / 2 });
  };

  const screenHeight = Dimensions.get("screen").height;

  return (
    <SafeAreaView style={styles.container}>
      {/* Sliding view */}
      <Animated.View style={[styles.slidingView, animatedStyle]}>
        <TouchableOpacity onPress={() => slideOut()} style={{ marginTop: 0.15 * screenHeight, zIndex: 1000 }}>
          <AntDesign name="back" size={24} color="black" />
        </TouchableOpacity>
        <Text category="h1" style={{ color: theme['gradient-to'], marginTop: 30, fontSize: 18, lineHeight: 27, textTransform: "uppercase", paddingLeft: 10, textAlign: "center" }}>
          Your tasks for
        </Text>
        <Text style={{ color: theme['gradient-to'], fontSize: 12, lineHeight: 18, paddingLeft: 10, marginBottom: 20, textAlign: "center" }}>
          {date?.dateString}
        </Text>
        <View style={styles.content}>
          {tasksCurrentdDay.map(task => (
            <View style={styles.taskCard} key={task.id}>
              <Text style={styles.description}>{task.description}</Text>

              {/* Show "Done" button if task is not completed */}
              {task.status !== "Completed" && !confettiStates[task.id] && (
                <TouchableOpacity onLayout={handleLayout} onPress={() => handlePressDoneBtn(task.id)} style={[styles.doneBtn]}>
                  <Text style={{ textAlign: "center" }}>Done</Text>
                </TouchableOpacity>
              )}

             
            </View>
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slidingView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    height: height,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: -5 },
    shadowRadius: 5,
    shadowOpacity: 0.3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    position: "relative",
  },
  taskCard: {
    marginVertical: 10,
    position: "relative",
    minHeight: 85,
    width: "90%",
    backgroundColor: theme['gradient-to'],
    paddingTop: 10,
    borderTopRightRadius: 30,
    borderTopStartRadius: 20,
    borderBottomStartRadius: 10,
    boxShadow: "rgba(0, 0, 0, 0.45) 0px 25px 20px -20px",
  },
  description: {
    fontSize: 16,
    fontWeight: 700,
    paddingHorizontal: 10,
    color: theme.secondary,
  },
  doneBtn: {
    position: "absolute",
    zIndex: 100,
    marginLeft: "auto",
    borderRadius: 30,
    backgroundColor: theme.secondary,
    padding: 5,
    bottom: -10,
    right: -10,
    width: 80,
  },
  confetti: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

export default TaskView;
