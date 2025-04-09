import uuid from 'react-native-uuid';
import db from '@/firebase/firebase-config';
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { DateData } from 'react-native-calendars';
import { useUserContext } from './UserContext';
import { date } from 'yup';

interface Parent {
    id: string;
    name: string;
    email: string;
}


// Define the Task type
interface Task {
    id?: string;
    description: string;
    date: DateData;
    parent: Parent;
    toFamilyMember: string;
    tasks?: string[];
}

// Define the TaskContext type
interface TaskContextType {
    tasks: Task[];
    addTaskToContext: (task: Task) => void;
    updateTask: (task: Task, taskId: string) => void;
    getTaskById: (id: string) => Task | undefined;
    fetchTasks: () => void; // needed to update ui when received notifications
}

// Create a context with default values
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Create a Provider component
export const TaskContextProvider = ({ children }: { children: ReactNode }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const fetchedTasks: Task[] = []

    const fetchTasks = async () => {    
    const q = query(collection(db, "tasks"),); //  where("parent", "==", user!.name)
    const querySnapshot = await getDocs(q);
    if(querySnapshot.empty) {
      console.log("no Task registered yet")
    } else {
      querySnapshot.forEach((doc) => {
       const task: Task = {
        id: doc.id,
        description: doc.data().description,
        date: doc.data().date,
        parent: doc.data().parent,
        toFamilyMember: doc.data().toFamilyMember,
        tasks: doc.data().tasks

    }
        fetchedTasks.push(task)
        
    });
    setTasks(fetchedTasks);
    
    }

    }

    useEffect(() => {
        fetchTasks();
       }, [])


       
       const addTaskToContext = async (task: Task) => {
        console.log("::::::::: task :::::::::", task);
        
        try {
            // Create a query to check if a task with the same date already exists
            const q = query(collection(db, "tasks"), where("date", "==", task.date), where("toFamilyMember", "==", task.toFamilyMember));
            const querySnapshot = await getDocs(q);
    
            if (querySnapshot.empty) {
                // If no task document exists for that date, create a new document    
                const docRef = await addDoc(collection(db, "tasks"), { 
                    parent: task.parent,
                    toFamilyMember: task.toFamilyMember,
                    date: task.date,  // Store the date
                    tasks: [{description: task.description, id: uuid.v4(), status: "Pending"}] // Initialize tasks array with the task description
                });
    
                // Optionally, fetch tasks (if you need to reflect the changes immediately)
                fetchTasks();
            } else {
                // If a task document already exists, update it by adding the new task description    
                for (const currentDoc of querySnapshot.docs) {
                    const tasksDocRef = doc(db, "tasks", currentDoc.id);
    
                    // Fetch the document to check if it has a 'tasks' array
                    const docSnapshot = await getDoc(tasksDocRef);
    
                    if (docSnapshot.exists()) {
                        const docData = docSnapshot.data();
    
                        // Check if the 'tasks' array exists
                        if (docData && Array.isArray(docData.tasks)) {
                            // If 'tasks' array exists, update it by adding the new task description
                            await updateDoc(tasksDocRef, {
                                tasks: arrayUnion({description: task.description, id: uuid.v4(), status: "Pending"}) // Add the task description to the array without duplicating
                            });
                        } else {
                            // If 'tasks' array doesn't exist, create it and add the task description
                            await updateDoc(tasksDocRef, {
                                tasks: [{description: task.description, id: uuid.v4(), status: "Pending"}] // Create the tasks array with the first task description
                            });
                        }
                    } else {
                        console.error("Document does not exist:", currentDoc.id);
                    }
                }
    
                // Optionally, fetch tasks (if you need to reflect the changes immediately)
                fetchTasks();
            }
    
        } catch (e) {
            console.error("Error adding task: ", e);
        }
    };

    const updateTask = async (task: any, taskId: string) => {
        try {
            // Query the task document that holds the tasks array based on the date
            const q = query(collection(db, "tasks"), where("date", "==", task.date));
            const querySnapshot = await getDocs(q);
    
            if (querySnapshot.empty) {
                console.log("No task registered yet");
            } else {
                querySnapshot.forEach(async (currentDoc) => {
                    
                    const docRef = doc(db, 'tasks', currentDoc.id);
    
                    // Retrieve the existing tasks array from the current document
                    const tasksArray = currentDoc.data().tasks || [];
    
                    // Find the task index by matching the taskId
                    const taskIndex = tasksArray.findIndex((t: any) => t.id === taskId);
    
                    if (taskIndex !== -1) {
                        // Update the specific task in the array
                        tasksArray[taskIndex] = { ...tasksArray[taskIndex], status: "Completed" }; // Merge task changes
    
                        // Update the document with the new tasks array
                        await updateDoc(docRef, {
                            tasks: tasksArray // Overwrite the entire tasks array
                        });
    
                        fetchTasks(); // Presumably a function that refreshes your tasks list
                    } else {
                        console.log('Task not found in the array');
                    }
                });
            }
        } catch (error) {
            console.error('Error updating document: ', error);
        }
    };

    const getTaskById = (id: string) => {
        return tasks.find((task) => task.id === id);
    };

    

    return (
        <TaskContext.Provider value={{ tasks, addTaskToContext, updateTask, getTaskById, fetchTasks }}>
            {children}
        </TaskContext.Provider>
    );
};



// Custom hook to use TaskContext
export const useTaskContext = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error("useTaskContext must be used within a TaskProvider");
    }
    return context;
};
