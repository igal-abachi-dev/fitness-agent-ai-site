import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import type { RootState } from './types'
import { createUiSlice } from './slices/ui.slice'
import { createChatDraftSlice } from './slices/chat-draft.slice'
import { createProfileSlice } from './slices/profile.slice'

export const useAppStore = create<RootState>()(
  devtools(
    persist(
      (...a) => ({
        ...createUiSlice(...a),
        ...createChatDraftSlice(...a),
        ...createProfileSlice(...a),
      }),
      {
        name: 'app-store',
        storage: createJSONStorage(() => localStorage),
        // Persist only durable preferences — never ephemeral UI or server data.
        partialize: (state) => ({ theme: state.theme, profile: state.profile }),
        version: 1,
      },
    ),
    { name: 'AppStore', enabled: import.meta.env.DEV },
  ),
)

// Atomic selector hooks. Select one field at a time so components re-render
// only when that field changes. For multi-field selects use `useShallow`.
export const useTheme = () => useAppStore((state) => state.theme)
export const useSetTheme = () => useAppStore((state) => state.setTheme)
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen)
export const useSetSidebarOpen = () => useAppStore((state) => state.setSidebarOpen)
export const useToggleSidebar = () => useAppStore((state) => state.toggleSidebar)

export const useProfile = () => useAppStore((state) => state.profile)
export const useProfileModalOpen = () =>
  useAppStore((state) => state.profileModalOpen)
export const useSetProfile = () => useAppStore((state) => state.setProfile)
export const useClearProfile = () => useAppStore((state) => state.clearProfile)
export const useOpenProfileModal = () =>
  useAppStore((state) => state.openProfileModal)
export const useCloseProfileModal = () =>
  useAppStore((state) => state.closeProfileModal)
