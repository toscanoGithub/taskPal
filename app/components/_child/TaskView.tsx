import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Dimensions, StyleSheet, SafeAreaView } from 'react-native';
import Animated, { Easing, withSpring, useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { Text } from '@ui-kitten/components';
import LottieView from 'lottie-react-native';
import theme from "../../theme.json";
import { useUserContext } from '@/contexts/UserContext';
import { useTaskContext } from '@/contexts/TaskContext';
import Ionicons from '@expo/vector-icons/Ionicons';

import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import db from '@/firebase/firebase-config';
import { DateData } from 'react-native-calendars';
import { Task } from '../../../types/Entity';
import * as Device from 'expo-device';

const { height } = Dimensions.get('screen');

interface TaskViewProps {
  isVisible: boolean;
  tasksCurrentdDay: { description: string, id: string, status: string }[];
  date?: DateData;
  dismiss: () => void;
}

type ButtonCenter = {
  x: number;
  y: number;
};

const TaskView: React.FC<TaskViewProps> = ({ isVisible, tasksCurrentdDay, date, dismiss }) => {
  const [confettiStates, setConfettiStates] = useState<{ [key: string]: boolean }>({});
  const [localTaskStatuses, setLocalTaskStatuses] = useState<{ [key: string]: string }>({});
  const { user } = useUserContext();
  const { updateTask } = useTaskContext();

  const slidePosition = useSharedValue(-height);
  const isTablet = Device.deviceType === Device.DeviceType.TABLET;

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
    setLocalTaskStatuses(prev => ({ ...prev, [taskId]: 'Pending Approval' }));
  
    try {
      const q = query(
        collection(db, "tasks"),
        where("date", "==", date),
        where("toFamilyMember", "==", user!.name)
      );
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        console.log("No task found.");
      } else {
        querySnapshot.forEach(async (currentDoc) => {
          const taskData = currentDoc.data() as Task;
  
          // Update the task status
          await updateTask(taskData, taskId);
  
          const familyMemberName = taskData.toFamilyMember;
  
          // Step 1: Get all completed tasks for this family member
          const completedTasksSnap = await getDocs(
            query(
              collection(db, "tasks"),
              where("toFamilyMember", "==", familyMemberName),
              where("status", "==", "Approved")
            )
          );
  
          let totalReward = 0;
          completedTasksSnap.forEach(doc => {
            const task = doc.data();
            if (typeof task.rewardValue === 'number') {
              totalReward += task.rewardValue;
            }
          });
  
          // Step 2: Get all users and find the one with this family member
          const usersSnapshot = await getDocs(collection(db, "users"));
  
          for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
  
            if (!Array.isArray(userData.members)) continue;
  
            const updatedMembers = userData.members.map((member: any) => {
              if (member.name === familyMemberName) {
                return {
                  ...member,
                  points: totalReward,
                };
              }
              return member;
            });
  
            const wasUpdated = JSON.stringify(updatedMembers) !== JSON.stringify(userData.members);
  
            // Step 3: If we updated any member, save back to Firestore
            if (wasUpdated) {
              await updateDoc(doc(db, "users", userDoc.id), {
                members: updatedMembers
              });
            }
          }
        });
      }
    } catch (error) {
      console.error("Error updating task or points:", error);
    }
  };
  
  

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date ? new Date(date.year, date.month - 1, date.day) : new Date());

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.slidingView, animatedStyle]}>
        <TouchableOpacity onPress={slideOut} style={{ marginTop: isTablet ? 150 : 120, zIndex: 1000, width: 70, height: 70, justifyContent: "center", alignItems: "center" }}>
          <Ionicons name="arrow-back-circle-outline" size={isTablet ? 70 : 50} color={theme['btn-bg-color']} />
        </TouchableOpacity>

        <Text category="h1" style={{ color: theme['gradient-to'], marginTop: 30, fontSize: isTablet ? 44 : 22, paddingLeft: 10, textAlign: "center" }}>
          Scheduled tasks for
        </Text>
        <Text style={{ color: theme['gradient-to'], fontSize: isTablet ? 30 : 16, marginBottom: 20, textAlign: "center" }}>
          {formattedDate}
        </Text>

        <View style={styles.content}>
          {tasksCurrentdDay.map(task => {
            const effectiveStatus = localTaskStatuses[task.id] || task.status;

            return (
              <View style={[styles.taskCard, { minHeight: isTablet ? 120 : 70 }]} key={task.id}>
                <Text style={[styles.description, { fontSize: isTablet ? 34 : 18 }]}>{task.description}</Text>

                {effectiveStatus === "Approved" ? (
                  <LottieView
                    source={require('../../../assets/animations/done.json')}
                    autoPlay
                    loop={false}
                    style={[
                      styles.confetti,
                      {
                        zIndex: 1000,
                        width: isTablet ? 150 : 100,
                        height: isTablet ? 150 : 100,
                        right: isTablet ? -75 : -50,
                        bottom: isTablet ? -75 : -50
                      }
                    ]}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => handlePressDoneBtn(task.id)}
                    disabled={effectiveStatus === "Pending Approval"}
                    style={[
                      styles.doneBtn,
                      { backgroundColor: theme.secondary }
                    ]}
                  >
                    <Text style={{ textAlign: "center" }}>
                      {effectiveStatus === "Pending Approval" ? "Pending Approval" : "Done"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
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
    width: "90%",
    paddingLeft: 10,
    backgroundColor: theme['gradient-to'],
    borderTopRightRadius: 30,
    borderTopStartRadius: 20,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    justifyContent: "center",
    alignItems: "flex-start"
  },
  description: {
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 10,
    color: theme.secondary,
  },
  doneBtn: {
    position: "absolute",
    zIndex: 100,
    marginLeft: "auto",
    borderRadius: 30,
    padding: 5,
    bottom: -10,
    right: -10,
    width: 100,
  },
  confetti: {
    position: 'absolute',
    width: 50,
    height: 50,
  },
});

export default TaskView;
