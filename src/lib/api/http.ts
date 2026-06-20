import { env } from '@/lib/env'

/**
 * Single network seam for the whole app — a tiny, zero-dependency Axios/Ky
 * replacement. It decides *how* a request is made and *how* errors are shaped;
 * TanStack Query sits above it and decides *when* to fetch and *what* to cache.
 *
 * Layering:
 *   component → TanStack Query hook → feature api fn → http<T>() → fetch()
 *
 * Endpoint paths carry their full prefix (e.g. `/api/conversations`); the base
 * comes from `VITE_API_BASE_URL` (empty = same origin). See `@/lib/env`.
 */

const DEFAULT_TIMEOUT_MS = 30_000

type PrimitiveQueryValue = string | number | boolean

export type QueryValue =
  | PrimitiveQueryValue
  | null
  | undefined
  | readonly PrimitiveQueryValue[]

export type QueryParams = Record<string, QueryValue>

export type ResponseType =
  | 'json'
  | 'text'
  | 'blob'
  | 'arrayBuffer'
  | 'formData'
  | 'response'

/** RFC 7807 problem details — the error shape ASP.NET Core / many APIs return. */
export type ProblemDetails = {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  errors?: Record<string, string[]>
  [key: string]: unknown
}

/** Non-2xx (or failed `validateStatus`) response. Carries the parsed body. */
export class ApiError extends Error {
  readonly status: number
  readonly body: unknown
  readonly problem: ProblemDetails | null
  readonly url: string
  readonly response: Response

  constructor(args: {
    message: string
    status: number
    body: unknown
    problem: ProblemDetails | null
    url: string
    response: Response
  }) {
    super(args.message)
    this.name = 'ApiError'
    this.status = args.status
    this.body = args.body
    this.problem = args.problem
    this.url = args.url
    this.response = args.response
  }
}

/** Request aborted because it exceeded `timeoutMs` (distinct from user cancel). */
export class ApiTimeoutError extends Error {
  readonly timeoutMs: number

  constructor(timeoutMs: number) {
    super(`Request timeout after ${timeoutMs}ms`)
    this.name = 'ApiTimeoutError'
    this.timeoutMs = timeoutMs
  }
}

/** 2xx response whose body failed to parse as JSON in strict JSON mode. */
export class InvalidJsonError extends Error {
  readonly status: number
  readonly url: string
  readonly text: string

  constructor(args: { status: number; url: string; text: string }) {
    super(
      `Server returned invalid JSON with status ${args.status}: ${args.text.slice(0, 200)}`,
    )
    this.name = 'InvalidJsonError'
    this.status = args.status
    this.url = args.url
    this.text = args.text
  }
}

export type HttpOptions<TBody = unknown> = Omit<RequestInit, 'body'> & {
  /** Query string params; arrays repeat the key, null/undefined are skipped. */
  query?: QueryParams
  /** Plain object → JSON; FormData/URLSearchParams/Blob/etc. passed through. */
  body?: TBody
  /** Per-request timeout. `false` disables it. Defaults to 30s. */
  timeoutMs?: number | false
  /** How to read the response body. Defaults to strict `'json'`. */
  responseType?: ResponseType
  /** Treat which statuses as success. Defaults to 2xx. */
  validateStatus?: (status: number) => boolean
  /** Allow absolute URLs in `path` (off by default to avoid SSRF-style mistakes). */
  allowAbsoluteUrl?: boolean
  /** Convenience for `Authorization: Bearer <token>`. */
  token?: string
}

function isAbsoluteUrl(path: string): boolean {
  return /^[a-z][a-z\d+\-.]*:/i.test(path) || path.startsWith('//')
}

function buildUrl(
  path: string,
  query?: QueryParams,
  allowAbsoluteUrl = false,
): string {
  if (isAbsoluteUrl(path) && !allowAbsoluteUrl) {
    throw new Error(`Absolute URLs are disabled for safety. Received: ${path}`)
  }

  const base = env.apiBaseUrl || globalThis.location?.origin || ''

  const combinedUrl = isAbsoluteUrl(path)
    ? path
    : `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`

  const url = new URL(combinedUrl, globalThis.location?.origin)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined) continue

      if (Array.isArray(value)) {
        for (const item of value) url.searchParams.append(key, String(item))
        continue
      }

      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return (
    value !== null &&
    typeof value === 'object' &&
    ('title' in value ||
      'status' in value ||
      'detail' in value ||
      'errors' in value)
  )
}

function isBodyInitLike(value: unknown): value is BodyInit {
  return (
    typeof value === 'string' ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof Blob ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value) ||
    (typeof ReadableStream !== 'undefined' && value instanceof ReadableStream)
  )
}

function createRequestBody(
  body: unknown,
  headers: Headers,
): BodyInit | undefined {
  if (body === undefined || body === null) return undefined

  if (body instanceof FormData) {
    // Let the browser set multipart/form-data with the correct boundary.
    headers.delete('Content-Type')
    return body
  }

  if (body instanceof URLSearchParams) {
    if (!headers.has('Content-Type')) {
      headers.set(
        'Content-Type',
        'application/x-www-form-urlencoded;charset=UTF-8',
      )
    }
    return body
  }

  if (isBodyInitLike(body)) return body

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return JSON.stringify(body)
}

function createAbortError(): DOMException {
  return new DOMException('The operation was aborted.', 'AbortError')
}

/**
 * Merge an optional caller signal with an optional timeout into one signal, and
 * return a `cleanup` that detaches listeners / clears the timer.
 */
function composeSignal(
  externalSignal: AbortSignal | undefined,
  timeoutMs: number | false,
): { signal?: AbortSignal; cleanup: () => void } {
  if (!externalSignal && timeoutMs === false) {
    return { signal: undefined, cleanup: () => undefined }
  }

  const controller = new AbortController()
  const cleanupCallbacks: Array<() => void> = []

  const abortOnce = (reason: unknown) => {
    if (!controller.signal.aborted) controller.abort(reason)
  }

  if (externalSignal) {
    if (externalSignal.aborted) {
      abortOnce(externalSignal.reason ?? createAbortError())
    } else {
      const onAbort = () =>
        abortOnce(externalSignal.reason ?? createAbortError())
      externalSignal.addEventListener('abort', onAbort, { once: true })
      cleanupCallbacks.push(() =>
        externalSignal.removeEventListener('abort', onAbort),
      )
    }
  }

  if (timeoutMs !== false) {
    const timeoutId = setTimeout(
      () => abortOnce(new ApiTimeoutError(timeoutMs)),
      timeoutMs,
    )
    cleanupCallbacks.push(() => clearTimeout(timeoutId))
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      for (const cleanup of cleanupCallbacks) cleanup()
    },
  }
}

function getErrorMessage(status: number, body: unknown): string {
  if (isProblemDetails(body) && typeof body.title === 'string') {
    return body.title
  }
  if (typeof body === 'string' && body.trim()) return body
  return `HTTP ${status}`
}

async function parseResponseBody(
  response: Response,
  responseType: ResponseType,
  url: string,
  method: string,
): Promise<unknown> {
  if (responseType === 'response') return response

  if (method === 'HEAD' || response.status === 204 || response.status === 205) {
    return null
  }

  if (responseType === 'blob') return response.blob()
  if (responseType === 'arrayBuffer') return response.arrayBuffer()
  if (responseType === 'formData') return response.formData()

  const text = await response.text()
  if (!text) return null
  if (responseType === 'text') return text

  // Strict JSON mode: if the API claims success but returns non-JSON, fail loud.
  try {
    return JSON.parse(text)
  } catch {
    throw new InvalidJsonError({ status: response.status, url, text })
  }
}

/**
 * Typed request helper. Resolves to the parsed body as `TResponse`; throws
 * `ApiError` (non-2xx), `ApiTimeoutError` (timeout), or `InvalidJsonError`
 * (bad JSON on success). User cancellation surfaces as a DOMException
 * `AbortError`, which TanStack Query swallows automatically.
 */
export async function http<TResponse = unknown, TBody = unknown>(
  path: string,
  options: HttpOptions<TBody> = {},
): Promise<TResponse> {
  const {
    query,
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    responseType = 'json',
    validateStatus = (status) => status >= 200 && status < 300,
    allowAbsoluteUrl = false,
    token,
    headers: customHeaders,
    method: explicitMethod,
    signal: externalSignal,
    ...fetchOptions
  } = options

  const method = (
    explicitMethod ?? (body === undefined ? 'GET' : 'POST')
  ).toUpperCase()

  if ((method === 'GET' || method === 'HEAD') && body !== undefined) {
    throw new Error(`${method} requests must not include a body.`)
  }

  const url = buildUrl(path, query, allowAbsoluteUrl)
  const headers = new Headers(customHeaders)

  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const requestBody = createRequestBody(body, headers)
  const composed = composeSignal(externalSignal ?? undefined, timeoutMs)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      method,
      headers,
      signal: composed.signal,
      body: requestBody,
    })

    const parsedBody = await parseResponseBody(
      response,
      responseType,
      url,
      method,
    )

    if (!validateStatus(response.status)) {
      throw new ApiError({
        message: getErrorMessage(response.status, parsedBody),
        status: response.status,
        body: parsedBody,
        problem: isProblemDetails(parsedBody) ? parsedBody : null,
        url,
        response,
      })
    }

    return parsedBody as TResponse
  } catch (error: unknown) {
    // Surface a timeout as ApiTimeoutError rather than a generic AbortError.
    if (
      composed.signal?.aborted &&
      composed.signal.reason instanceof ApiTimeoutError
    ) {
      throw composed.signal.reason
    }
    throw error
  } finally {
    composed.cleanup()
  }
}
