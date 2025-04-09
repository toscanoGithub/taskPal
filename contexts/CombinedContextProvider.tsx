// CombinedContextProvider.tsx
import React from 'react';
import { TaskContextProvider } from "./TaskContext";  
import { UserContextProvider } from './UserContext';

const CombinedContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserContextProvider>
          <TaskContextProvider>
          {children}
      </TaskContextProvider>
    </UserContextProvider>
  );
};

export default CombinedContextProvider;
