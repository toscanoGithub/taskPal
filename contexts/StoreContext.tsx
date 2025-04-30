
import { Reward } from '../types/Entity'; 
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

interface RewardContextType {
    rewards: RewardWithId[];
    fetchRewards: (familyEmail: string) => Promise<void>;
    createReward: (reward: Reward) => Promise<void>;
    updateReward: (id: string, reward: Partial<Reward>) => Promise<void>;
    deleteReward: (id: string) => Promise<void>;
  }
  
  interface RewardWithId extends Reward {
    id: string;
  }

  
  const RewardContext = createContext<RewardContextType | undefined>(undefined);

export const RewardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rewards, setRewards] = useState<RewardWithId[]>([]);

  const fetchRewards = async (familyEmail: string) => {
    const q = query(collection(db, 'rewards'), where('familyEmail', '==', familyEmail));
    const snapshot = await getDocs(q);
    const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RewardWithId));
    console.log("::::::::::::::", fetched);
    
    setRewards(fetched);
  };

  const createReward = async (reward: Reward) => {
    await addDoc(collection(db, 'rewards'), reward);
    await fetchRewards(reward.familyEmail); // refresh
  };

  const updateReward = async (id: string, reward: Partial<Reward>) => {
    const { id: _, ...rewardData } = reward; // Exclude `id` if it exists
    const ref = doc(db, 'rewards', id);
    await updateDoc(ref, rewardData);
    // Optionally refetch

    if (reward.familyEmail) {
      fetchRewards(reward.familyEmail);
    } else {
      console.error("familyEmail is undefined");
    }
  };

  const deleteReward = async (id: string) => {
    const ref = doc(db, 'rewards', id);
    await updateDoc(ref, { isActive: false });
    // Optionally refetch
  };

  return (
    <RewardContext.Provider value={{ rewards, fetchRewards, createReward, updateReward, deleteReward }}>
      {children}
    </RewardContext.Provider>
  );
};


export const useRewardContext = (): RewardContextType => {
    const context = useContext(RewardContext);
    if (!context) {
      throw new Error('useRewardContext must be used within a RewardProvider');
    }
    return context;
  };
  