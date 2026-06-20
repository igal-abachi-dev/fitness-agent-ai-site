import { useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { createCoachChatTransport } from '../api/chat-transport'

/**
 * Streaming coach chat, wired to `POST /v1/coach/chat` via the AI SDK.
 *
 * Prepared for the chat UI (built later): returns `messages`, `sendMessage`,
 * `status`, `error`, `stop`, `regenerate`, etc. The transport is memoized so a
 * single instance survives re-renders.
 *
 * Note: the backend expects AI SDK `UIMessage` shape (`{ id, role, parts }`),
 * which `useChat` produces automatically.
 */
export function useCoachChat() {
  const transport = useMemo(() => createCoachChatTransport(), [])
  return useChat({ transport })
}
