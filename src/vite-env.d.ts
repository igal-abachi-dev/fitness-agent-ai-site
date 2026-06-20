/// <reference types="vite/client" />

/**
 * Type-safe custom env vars. Only `VITE_`-prefixed values are exposed to the
 * client bundle — never put secrets here, they ship to the browser.
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
