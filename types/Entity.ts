import { DateData } from "react-native-calendars";


export interface User {
    id: string;
    name: string;
    email: string;
    isFamilyMember: boolean;
    members?: FamilyMember[]
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    isFamilyMember: boolean;
    members?: FamilyMember[]
}

export interface FamilyMember {
    name: string;
    passcode: string;
    email?: string;
}




export interface Parent {
    id: string;
    name: string;
    email: string;
    members?: FamilyMember[]
}


interface TaskItem {
    id: string;
    description: string;
    status: string;
}


// Define the Task type
export interface Task {
    // [x: string]: TaskItem[];
    id?: string;
    date: DateData;
    parent: Parent;
    toFamilyMember: string;
    description: string,
    tasks: TaskItem[];
    
}


