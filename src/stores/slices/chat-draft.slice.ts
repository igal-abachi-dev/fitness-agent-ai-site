import type { StateCreator } from 'zustand'
import type { RootState } from '../types'

/**
 * Ephemeral per-conversation composer text. This is client/UI state (an
 * unsent draft), so it belongs in Zustand — not TanStack Query. Persisted
 * messages and history will live in the Query cache instead.
 *
 * Keyed by conversation id so each thread keeps its own in-progress draft.
 */
export interface ChatDraftSlice {
  draftByConversationId: Record<string, string>
  setDraft: (conversationId: string, value: string) => void
  clearDraft: (conversationId: string) => void
}

export const createChatDraftSlice: StateCreator<
  RootState,
  [],
  [],
  ChatDraftSlice
> = (set) => ({
  draftByConversationId: {},
  setDraft: (conversationId, value) =>
    set((state) => ({
      draftByConversationId: {
        ...state.draftByConversationId,
        [conversationId]: value,
      },
    })),
  clearDraft: (conversationId) =>
    set((state) => {
      const next = { ...state.draftByConversationId }
      delete next[conversationId]
      return { draftByConversationId: next }
    }),
})
