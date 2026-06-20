import { isRouteErrorResponse, useRouteError } from 'react-router'

/**
 * Route-level error boundary. React Router data mode will not surface render
 * errors in production without one of these wired into the route tree.
 */
export function RouteError() {
  const error = useRouteError()

  let title = 'Something went wrong'
  let message = 'An unexpected error occurred.'

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? '404' : 'Error'
    message =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || message
  } else if (error instanceof Error) {
    message = error.message
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground text-sm">{message}</p>
    </main>
  )
}
