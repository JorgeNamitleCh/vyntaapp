import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GoalsState {
  dailyGoal:   number | null;
  monthlyGoal: number | null;
  setDailyGoal:   (v: number | null) => void;
  setMonthlyGoal: (v: number | null) => void;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    set => ({
      dailyGoal:   null,
      monthlyGoal: null,
      setDailyGoal:   v => set({ dailyGoal: v }),
      setMonthlyGoal: v => set({ monthlyGoal: v }),
    }),
    {
      name:    'vynta-goals',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
