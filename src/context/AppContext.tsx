import React, { createContext, useContext, useState, ReactNode } from "react";

// 1. Define el tipo del contexto
type AppContextType = {
  activeView: number;
  setActiveView: (view: number) => void;
};

// 2. Crea el contexto con valor por defecto
const AppContext = createContext<AppContextType>({
  activeView: 0,
  setActiveView: () => {},
});

// 3. Hook para usar el contexto
export const useAppContext = () => useContext(AppContext);

// 4. Define el proveedor
type Props = {
  children: ReactNode;
};

export const AppProvider = ({ children }: Props) => {
  const [activeView, setActiveView] = useState(0);

  const value: AppContextType = {
    activeView,
    setActiveView,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
