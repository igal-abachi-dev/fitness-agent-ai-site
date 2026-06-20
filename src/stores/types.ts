import type { UiSlice } from './slices/ui.slice'
import type { ChatDraftSlice } from './slices/chat-draft.slice'
import type { ProfileSlice } from './slices/profile.slice'

/** Intersection of every slice. Each slice creator is typed against this. */
export type RootState = UiSlice & ChatDraftSlice & ProfileSlice
