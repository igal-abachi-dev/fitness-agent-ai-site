/** Domain types for the chat feature. Shared across its api / hooks / components. */

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: ChatRole
  /** Raw Markdown content (rendered later with a Markdown pipeline). */
  content: string
  createdAt: string
}

export interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}
