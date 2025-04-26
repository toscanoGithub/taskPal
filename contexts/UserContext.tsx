import db from '@/firebase/firebase-config';
import { FamilyMember } from '@/types/Entity';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
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

            console.log("newMember ::::::::::::::", newMember, newMember.memberPushToken);
            
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
