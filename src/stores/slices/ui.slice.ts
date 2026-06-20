import type { StateCreator } from 'zustand'
import type { RootState } from '../types'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface UiSlice {
  theme: ThemeMode
  sidebarOpen: boolean
  setTheme: (theme: ThemeMode) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

// StateCreator<WholeStore, Mutators, [], ThisSlice> — first param is the whole
// store so cross-slice `get()` stays typed; fourth is this slice's own shape.
export const createUiSlice: StateCreator<RootState, [], [], UiSlice> = (set) => ({
  theme: 'system',
  sidebarOpen: true,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
})
