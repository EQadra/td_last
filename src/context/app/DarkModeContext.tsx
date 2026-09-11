import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type DarkModeContextType = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [loaded, setLoaded] = useState(false);

  /* =========================
     LOAD FROM STORAGE
  ========================= */
  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        const value = await AsyncStorage.getItem("darkMode");
        if (value !== null) {
          setDarkMode(JSON.parse(value));
        }
      } catch (e) {
        console.log("Error loading dark mode", e);
      } finally {
        setLoaded(true);
      }
    };

    loadDarkMode();
  }, []);

  /* =========================
     SAVE TO STORAGE
  ========================= */
  useEffect(() => {
    AsyncStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  /* =========================
     EVITA PARPADEO (FLASH)
  ========================= */
  if (!loaded) return null;

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) throw new Error("useDarkMode debe usarse dentro de <DarkModeProvider>");
  return context;
};