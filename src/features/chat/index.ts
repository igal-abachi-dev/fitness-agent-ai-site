/**
 * Public surface of the chat feature. Import from `@/features/chat` rather than
 * reaching into internal files, so the feature's internals stay refactorable.
 */
export { useChatDraft } from './hooks/use-chat-draft'
export { useCoachChat } from './hooks/use-coach-chat'
export { createCoachChatTransport, COACH_CHAT_PATH } from './api/chat-transport'
export type { ChatMessage, ChatRole, Conversation } from './types'
