import { DefaultChatTransport } from 'ai'
import { env } from '@/lib/env'

/**
 * Transport for the streaming coach chat endpoint.
 *
 * `POST /v1/coach/chat` returns an AI SDK **UI message stream** (SSE), not JSON,
 * so it does NOT go through `http<T>()` (which is for request/response). The AI
 * SDK's `DefaultChatTransport` handles the SSE decode + UIMessage protocol.
 *
 * Same base-URL convention as `@/lib/api/http`: empty `apiBaseUrl` → same-origin
 * relative path; otherwise the configured backend origin.
 */
export const COACH_CHAT_PATH = '/v1/coach/chat'

export function createCoachChatTransport() {
  return new DefaultChatTransport({
    api: `${env.apiBaseUrl}${COACH_CHAT_PATH}`,
  })
}
