// context/AvatarContext.tsx - SIN DEPENDENCIA CIRCULAR
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface AvatarContextType {
  avatarKey: number;
  avatarImage: string | null;
  refreshAvatar: () => void;
  setAvatarImage: (image: string | null) => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const AvatarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const [avatarImage, setAvatarImage] = useState<string | null>(null);

  const refreshAvatar = () => {
    setAvatarKey(Date.now());
  };

  return (
    <AvatarContext.Provider value={{ 
      avatarKey, 
      avatarImage, 
      refreshAvatar, 
      setAvatarImage 
    }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar debe usarse dentro de AvatarProvider');
  }
  return context;
};