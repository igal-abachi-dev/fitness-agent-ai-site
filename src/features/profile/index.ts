export { ProfileForm } from './components/profile-form'
export { ProfileModal } from './components/profile-modal'
export {
  profileSchema,
  PROFILE_LABELS,
  SEX_VALUES,
  PRIMARY_GOAL_VALUES,
  EXPERIENCE_VALUES,
  EQUIPMENT_VALUES,
  type Profile,
} from './profile.schema'

// Re-export the profile store hooks so consumers can import everything
// profile-related from a single place: `@/features/profile`.
export {
  useProfile,
  useProfileModalOpen,
  useSetProfile,
  useClearProfile,
  useOpenProfileModal,
  useCloseProfileModal,
} from '@/stores/useAppStore'
