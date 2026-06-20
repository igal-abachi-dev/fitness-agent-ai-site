import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useSetTheme, useTheme } from '@/stores/useAppStore'

// React Router `lazy` expects route props; `Component` is the rendered element.
export function Component() {
  const theme = useTheme()
  const setTheme = useSetTheme()

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center gap-6 p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Fitness Agent AI</CardTitle>
          <CardDescription>
            React 19 · Vite · React Router (data mode) · TanStack Query · Zustand
            · shadcn/ui + Tailwind v4
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            Toggle theme (current: {theme})
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success('Everything is wired up.')}
          >
            Test toast
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
