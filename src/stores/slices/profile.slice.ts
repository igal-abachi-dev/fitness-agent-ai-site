import type { StateCreator } from 'zustand'
import type { RootState } from '../types'
import type { Profile } from '@/features/profile/profile.schema'

/**
 * The user profile (coach assessment) collected once via the profile modal.
 *
 * `profile` is durable preference data and IS persisted to localStorage (see
 * `partialize` in the store). `profileModalOpen` is ephemeral UI state and is
 * intentionally NOT persisted, so a refresh never re-pops the modal on its own —
 * the modal only auto-opens when no profile exists yet.
 */
export interface ProfileSlice {
  profile: Profile | null
  profileModalOpen: boolean
  setProfile: (profile: Profile) => void
  clearProfile: () => void
  openProfileModal: () => void
  closeProfileModal: () => void
}

export const createProfileSlice: StateCreator<
  RootState,
  [],
  [],
  ProfileSlice
> = (set) => ({
  profile: null,
  profileModalOpen: false,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null, profileModalOpen: false }),
  openProfileModal: () => set({ profileModalOpen: true }),
  closeProfileModal: () => set({ profileModalOpen: false }),
})
