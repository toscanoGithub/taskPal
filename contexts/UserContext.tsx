import db from '@/firebase/firebase-config';
import { FamilyMember } from '@/types/Entity';
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Alert } from 'react-native';

type AuthUser = {
    id?: string;
    email?: string;
    name: string;
    isFamilyMember: boolean;
    members?: FamilyMember[];
    parentPushToken?: string;
    memberPushToken?: string;
    points?: number;
};

type UserContextType = {
    email: string | undefined;
    user: AuthUser | null;
    setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
    updateUser: React.Dispatch<{ name: string; passcode: string, parentPushToken: string, points: number }>;
    updatePointsforAFamilyMember: React.Dispatch<{ name: string; passcode: string, parentPushToken: string, points: number }>;

    
};

const UserContext = createContext<UserContextType | undefined>(undefined);

type UserContextProviderProps = {
    children: ReactNode;
};

export const UserContextProvider = ({ children }: UserContextProviderProps) => {
    const [user, setUser] = useState<AuthUser | null>(null);

    const value: UserContextType = {
        email: user?.email,
        user,
        setUser,
        updateUser: async function (value: { name: string; passcode: string, parentPushToken: string, points: number }): Promise<void> {
            // Query the doc to edit
            const userId = user!.id;
            console.log("userId ::::::::::::::", userId);
            const docRef = doc(db, 'users', user?.id ?? 'userid');

            // Object you want to push to the 'members' array
            const newMember: FamilyMember = {
                ...value,
                email: user?.email,
                memberPushToken: user?.memberPushToken ?? '',
                isFamilyMember: true,
                parentPushToken: user?.parentPushToken ?? ''
            };

            console.log("newMember ::::::::::::::", newMember, newMember.points);
            
            // Update the document
            await updateDoc(docRef, {
                members: arrayUnion(newMember)
            });

            // If `user?.members` exists, spread the existing members and add the new member, otherwise just set the new member
            setUser(prevUser => {
                if (!prevUser) {
                    // If prevUser is null, return the new state with only the new member
                    return {
                        email: user?.email ?? '',
                        name: '',
                        isFamilyMember: false,
                        members: [newMember],  // Set the new member in the array
                        parentPushToken: ""
                        
                    };
                }
            
                // If prevUser is defined, append the new member to the existing members array
                return {
                    ...prevUser,
                    members: prevUser.members ? [...prevUser.members, newMember] : [newMember]
                };
            });
            
        },

        updatePointsforAFamilyMember: async function (value: { name: string; passcode: string, parentPushToken: string, points: number }): Promise<void> {
            const userId = user!.id;
            if (!userId) {
                console.error("User ID is undefined.");
                return;
            }
            const docRef = doc(db, 'users', userId);
        
            // Fetch the current document
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                console.error("User document does not exist.");
                return;
            }
        
            const data = docSnap.data();
            const members: FamilyMember[] = data.members || [];
        
            // Find and update the specific member by some identifier (e.g., name or email)
            const updatedMembers = members.map(member => {
                if (member.name === value.name) {
                    return {
                        ...member,
                        points: value.points
                    };
                }
                return member;
            });
        
            // Overwrite the members array with the updated one
            await updateDoc(docRef, {
                members: updatedMembers
            });
        
            setUser(prevUser => {
                if (!prevUser) return null;
              
                // Update just the points for the current user (e.g., if the current user is a family member)
                if (prevUser.isFamilyMember) {
                  return {
                    ...prevUser,
                    points: value.points
                  };
                }
              
                // Or update a member inside the members array
                const updatedMembers = (prevUser.members ?? []).map(member =>
                  member.name === value.name ? { ...member, points: value.points } : member
                );
              
                return {
                  ...prevUser,
                  members: updatedMembers
                };
              });
              
        }
        
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use the UserContext
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext must be used within a UserContextProvider');
    }
    return context;
};
