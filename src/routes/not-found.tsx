import { Link } from 'react-router'

import { Button } from '@/components/ui/button'

/** Catch-all (`path: '*'`) rendered inside the app shell for unknown routes. */
export function Component() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="text-muted-foreground text-sm">This page does not exist.</p>
      <Button asChild>
        <Link to="/">Go home</Link>
      </Button>
    </div>
  )
}
