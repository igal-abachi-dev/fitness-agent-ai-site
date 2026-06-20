import { setupServer } from 'msw/node'

import { handlers } from './handlers'

/** Node request-mocking server shared across the test run (see test/setup.ts). */
export const server = setupServer(...handlers)
