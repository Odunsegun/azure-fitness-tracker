import React, { createContext, useContext, useEffect, useState } from "react";

const PreferencesContext = createContext();

const DEFAULT_PREFS = { units: "metric", theme: "light", sync: false };

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("preferences")) ?? DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  // Persist + apply side effects (theme)
  useEffect(() => {
    localStorage.setItem("preferences", JSON.stringify(prefs));

    const root = document.documentElement; // <html>
    if (prefs.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [prefs]);

  return (
    <PreferencesContext.Provider value={{ prefs, setPrefs }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
