import { create } from "zustand";

type View = "calendar" | "settings";

interface AppState {
  currentView: View;
  setCurrentView: (view: View) => void;
  currentWeek: Date;
  setCurrentWeek: (date: Date) => void;
  navigateWeek: (direction: "prev" | "next") => void;
  isWeekLoading: boolean;
}

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

export const useAppStore = create<AppState>((set, get) => ({
  currentView: "calendar",
  setCurrentView: (view) => set({ currentView: view }),
  currentWeek: getWeekStart(new Date()),
  setCurrentWeek: (date) => set({ currentWeek: getWeekStart(date) }),
  navigateWeek: (direction) => {
    set({ isWeekLoading: true });
    // Simulate async operation
    setTimeout(() => {
      const { currentWeek } = get();
      const newWeek = new Date(currentWeek);
      newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7));
      set({ currentWeek: newWeek, isWeekLoading: false });
    }, 150);
  },
  isWeekLoading: false,
}));
