import { MessageSquare } from 'lucide-react'

/**
 * Streaming coach chat (`POST /v1/coach/chat`). Transport + `useCoachChat` are
 * wired (`@/features/chat`); the message list + composer UI land here next.
 */
export function Component() {
  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center gap-4 p-6 text-center">
      <MessageSquare className="text-muted-foreground size-10" />
      <h1 className="text-2xl font-semibold">Coach chat</h1>
      <p className="text-muted-foreground max-w-prose text-sm">
        Multi-turn streaming chat with the fitness coach. The SSE transport is
        already wired via the AI SDK (<code>useCoachChat</code>) — the message
        list, Markdown rendering, and composer UI come next.
      </p>
    </div>
  )
}
