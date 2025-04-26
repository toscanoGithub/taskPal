import uuid from 'react-native-uuid';
import db from '@/firebase/firebase-config';

import {
  arrayUnion,
  doc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
  getDoc,
  addDoc,
} from 'firebase/firestore';

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';

import { DateData } from 'react-native-calendars';
import { Task, TaskItem } from '@/types/Entity';

interface TaskContextType {
  tasks: Task[];
  addTaskToContext: (task: Task) => void;
  updateTask: (task: Task, taskId: string) => void;
  getTaskById: (id: string) => Task | undefined;
  fetchTasks: () => void;
  toggleTaskStatusInFirestore: (
    familyMember: string,
    date: DateData,
    taskId: string
  ) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskContextProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const fetchedTasks: Task[] = [];

  const fetchTasks = async () => {
    const q = query(collection(db, 'tasks'));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log('No task registered yet');
    } else {
      querySnapshot.forEach((doc) => {
        const task: Task = {
          id: doc.id,
          description: doc.data().description,
          date: doc.data().date,
          parent: doc.data().parent,
          toFamilyMember: doc.data().toFamilyMember,
          tasks: doc.data().tasks,
        };
        fetchedTasks.push(task);
      });
      setTasks(fetchedTasks);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTaskToContext = async (task: Task) => {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('date', '==', task.date),
        where('toFamilyMember', '==', task.toFamilyMember)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(collection(db, 'tasks'), {
          parent: task.parent,
          toFamilyMember: task.toFamilyMember,
          date: task.date,
          tasks: [
            {
              description: task.description,
              rewardValue: task.rewardValue,
              id: uuid.v4(),
              status: 'In Progress',
            },
          ],
        });
        fetchTasks();
      } else {
        for (const currentDoc of querySnapshot.docs) {
          const tasksDocRef = doc(db, 'tasks', currentDoc.id);
          const docSnapshot = await getDoc(tasksDocRef);

          if (docSnapshot.exists()) {
            const docData = docSnapshot.data();

            if (Array.isArray(docData.tasks)) {
              await updateDoc(tasksDocRef, {
                tasks: arrayUnion({
                  description: task.description,
                  rewardValue: task.rewardValue,
                  id: uuid.v4(),
                  status: 'In Progress',
                }),
              });
            } else {
              await updateDoc(tasksDocRef, {
                tasks: [
                  {
                    description: task.description,
                    rewardValue: task.rewardValue,
                    id: uuid.v4(),
                    status: 'In Progress',
                  },
                ],
              });
            }
          }
        }
        fetchTasks();
      }
    } catch (e) {
      console.error('Error adding task: ', e);
    }
  };

  const updateTask = async (task: Task, taskId: string) => {
    try {
      const q = query(collection(db, 'tasks'), where('date', '==', task.date));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No task registered yet');
      } else {
        querySnapshot.forEach(async (currentDoc) => {
          const docRef = doc(db, 'tasks', currentDoc.id);
          const tasksArray = currentDoc.data().tasks || [];

          const taskIndex = tasksArray.findIndex((t: any) => t.id === taskId);

          if (taskIndex !== -1) {
            tasksArray[taskIndex] = {
              ...tasksArray[taskIndex],
              status: 'Pending Approval',
            };

            await updateDoc(docRef, {
              tasks: tasksArray,
            });

            fetchTasks();
          } else {
            console.log('Task not found in the array');
          }
        });
      }
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  };

  const toggleTaskStatusInFirestore = async (
    familyMember: string,
    date: DateData,
    taskId: string
  ) => {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('date', '==', date),
        where('toFamilyMember', '==', familyMember)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No task document found');
        return;
      }

      querySnapshot.forEach(async (currentDoc) => {
        const email = currentDoc.data().parent.email;
        const docRef = doc(db, 'tasks', currentDoc.id);
        const docData = currentDoc.data();
        const tasksArray = docData.tasks || [];

        let rewardValueDelta = 0;

        const updatedTasks = tasksArray.map((task: any) => {
          if (task.id === taskId) {
            const wasApproved = task.status === 'Approved';
            const reward = Number(task.rewardValue || 0);
            rewardValueDelta += wasApproved ? -reward : reward;

            return {
              ...task,
              status: wasApproved ? 'Pending Approval' : 'Approved',
            };
          }
          return task;
        });

        await updateDoc(docRef, {
          tasks: updatedTasks,
        });

        fetchTasks();

        updateFamilyMemberPoints(familyMember, rewardValueDelta, email);
      });
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  };

  const updateFamilyMemberPoints = async (
    familyMember: string,
    pointsDelta: number,
    email: string
  ) => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No user with that family member found');
        return;
      }

      querySnapshot.forEach(async (currentDoc) => {
        const docRef = doc(db, 'users', currentDoc.id);
        const userData = currentDoc.data();
        const members = userData.members || [];

        const updatedMembers = members.map((member: any) => {
          if (member.name === familyMember) {
            return {
              ...member,
              points: (member.points || 0) + pointsDelta,
            };
          }
          return member;
        });

        await updateDoc(docRef, {
          members: updatedMembers,
        });

        console.log(`Updated points for ${familyMember} by ${pointsDelta}`);
      });
    } catch (error) {
      console.error('Error updating family member points:', error);
    }
  };

  const getTaskById = (id: string) => {
    return tasks.find((task) => task.id === id);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTaskToContext,
        updateTask,
        getTaskById,
        fetchTasks,
        toggleTaskStatusInFirestore,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
