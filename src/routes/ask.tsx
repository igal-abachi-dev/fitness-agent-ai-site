import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronDown,
  Loader2,
  Sparkles,
 // UserRound,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useAskCoach } from '@/features/coach'
import type { CoachAskResponse } from '@/features/coach'
import { useOpenProfileModal, useProfile } from '@/features/profile'
import { cn } from '@/lib/utils'

const askSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, 'Enter a question')
    .max(8000, 'Keep it under 8000 characters'),
  useProfile: z.boolean(),
})

type AskForm = z.infer<typeof askSchema>

//  function UserMessage({ text }: { text: string }) {
//   return (
//     <div className="flex items-start gap-3">
//       <Avatar size="sm" className="mt-0.5">
//         <AvatarFallback>
//           <UserRound className="size-3.5" />
//         </AvatarFallback>
//       </Avatar>
//       <div className="bg-muted max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm whitespace-pre-wrap">
//         {text}
//       </div>
//     </div>
//   )
// }

function AssistantLoading() {
  return (
    <div className="flex items-start gap-3">
      <Avatar size="sm" className="mt-0.5">
        <AvatarFallback>
          <Sparkles className="size-3.5" />
        </AvatarFallback>
      </Avatar>
      <div className="flex w-full max-w-[85%] flex-col gap-3 rounded-2xl rounded-tl-sm border bg-card px-4 py-3">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" />
          <span>Thinking…</span>
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[92%]" />
          <Skeleton className="h-3 w-[78%]" />
        </div>
      </div>
    </div>
  )
}

function ReasoningSection({ text }: { text: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 rounded-md text-xs transition-colors">
        <Sparkles className="size-3.5" />
        <span>{open ? 'Hide reasoning' : 'Show reasoning'}</span>
        <ChevronDown
          className={cn(
            'size-3.5 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="bg-muted/50 text-muted-foreground rounded-lg border px-3 py-2.5 text-xs whitespace-pre-wrap">
          {text}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function AssistantAnswer({ data }: { data: CoachAskResponse }) {
  const usageParts: string[] = [
    `${data.steps} step${data.steps === 1 ? '' : 's'}`,
  ]

  if (data.usage.inputTokens != null) {
    usageParts.push(`${data.usage.inputTokens} input tokens`)
  }
  if (data.usage.outputTokens != null) {
    usageParts.push(`${data.usage.outputTokens} output tokens`)
  }
  if (data.usage.reasoningTokens != null) {
    usageParts.push(`${data.usage.reasoningTokens} reasoning tokens`)
  }

  return (
    <div className="flex items-start gap-3">
      <Avatar size="sm" className="mt-0.5">
        <AvatarFallback>
          <Sparkles className="size-3.5" />
        </AvatarFallback>
      </Avatar>
      <div className="flex w-full max-w-[85%] flex-col gap-3 rounded-2xl rounded-tl-sm border bg-card px-4 py-3">
        {data.reasoningText && (
          <ReasoningSection text={data.reasoningText} />
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.text}</p>
        <p className="text-muted-foreground text-xs">{usageParts.join(' · ')}</p>
      </div>
    </div>
  )
}

/** One-shot coaching question (`POST /v1/coach/ask`) via `useAskCoach`. */
export function Component() {
  const profile = useProfile()
  const openProfileModal = useOpenProfileModal()
  const ask = useAskCoach()
  const responseRef = useRef<HTMLDivElement>(null)
  const [lastPrompt, setLastPrompt] = useState<string | null>(null)

  const form = useForm<AskForm>({
    resolver: zodResolver(askSchema),
    defaultValues: { prompt: '', useProfile: true },
  })

  const onSubmit = form.handleSubmit((values) => {
    setLastPrompt(values.prompt)
    ask.mutate({
      prompt: values.prompt,
      profile: values.useProfile && profile ? profile : undefined,
    })
  })

  const showConversation = lastPrompt != null && (ask.isPending || ask.data != null)

  useEffect(() => {
    if (ask.isPending && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [ask.isPending])

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Sparkles className="size-6" />
          Ask the coach
        </h1>
        <p className="text-muted-foreground text-sm">
          A single, concise answer — optionally grounded in your profile.
        </p>
      </header>

      <Form {...form}>
        <form onSubmit={onSubmit} className="grid gap-4">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Your question</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={4}
                    disabled={ask.isPending}
                    placeholder="e.g. How should I structure my week to bring up a lagging chest?"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between gap-3">
            <FormField
              control={form.control}
              name="useProfile"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!profile || ask.isPending}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Use my profile for context
                  </FormLabel>
                </FormItem>
              )}
            />

            {!profile && (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={openProfileModal}
              >
                Set up profile
              </Button>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={ask.isPending}>
              {ask.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {ask.isPending ? 'Asking…' : 'Ask'}
            </Button>
          </div>
        </form>
      </Form>

      {ask.isError && (
        <p className="text-destructive text-sm" role="alert">
          {ask.error.message}
        </p>
      )}

      {showConversation && (
        <div ref={responseRef} className="flex flex-col gap-4">
          {/* <UserMessage text={lastPrompt} /> */}
          {ask.isPending ? (
            <AssistantLoading />
          ) : ask.data ? (
            <AssistantAnswer data={ask.data} />
          ) : null}
        </div>
      )}
    </div>
  )
}
