// CombinedContextProvider.tsx
import React from 'react';
import { TaskContextProvider } from "./TaskContext";  
import { UserContextProvider } from './UserContext';
import { RewardProvider } from './StoreContext';

const CombinedContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserContextProvider>
          <TaskContextProvider>
            <RewardProvider>
              {children}
            </RewardProvider>
          
      </TaskContextProvider>
    </UserContextProvider>
  );
};

export default CombinedContextProvider;
