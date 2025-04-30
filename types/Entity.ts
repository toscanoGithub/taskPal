import { DateData } from "react-native-calendars";


export interface User {
    id: string;
    name: string;
    email: string;
    isFamilyMember: boolean;
    members?: FamilyMember[];
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    isFamilyMember: boolean;
    members?: FamilyMember[];
}

export interface FamilyMember {
    memberPushToken: string;
    name: string;
    passcode: string;
    email?: string;
    parentPushToken?: string;
    points?: number;
    isFamilyMember: boolean;
}




export interface Parent {
    id: string;
    name: string;
    email: string;
  }
  
  export interface TaskItem {
    id: string;
    description: string;
    status: 'In Progress' | 'Pending Approval' | 'Approved';
    rewardValue: number;
  }
  
  export interface Task {
    id?: string;
    description: string;
    date: DateData;
    parent: Parent;
    rewardValue?: number;
    toFamilyMember: string;
    tasks: TaskItem[]; // <-- make sure this is NOT optional
  }


  export interface Reward {
    id?: string;
    title: string;
    description: string;
    cost: number;
    redeemed: boolean;
    availableTo: string[];     // family member names
    familyEmail: string;       // unique identifier per family
    redeemedBy: string;      // soft-deletion or visibility
  };


