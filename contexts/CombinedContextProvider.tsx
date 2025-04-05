// CombinedContextProvider.tsx
import React from 'react';
import { UserContextProvider } from './UserContext';

const CombinedContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserContextProvider>
          {children}
    </UserContextProvider>
  );
};

export default CombinedContextProvider;
