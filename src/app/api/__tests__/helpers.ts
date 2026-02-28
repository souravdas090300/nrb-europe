/**
 * @jest-environment node
 */
/**
 * Shared helpers for API route integration tests.
 * Provides mock factories for NextRequest, sessions, and common mock setups.
 */
import { NextRequest } from 'next/server'

/** Build a NextRequest suitable for GET route handlers. */
export function createGetRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'))
}

/** Build a NextRequest suitable for POST / PATCH / DELETE route handlers. */
export function createJsonRequest(
  url: string,
  body: Record<string, unknown>,
  method: 'POST' | 'PATCH' | 'DELETE' = 'POST'
): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** Factory for mock sessions returned by `getServerSession`. */
export function mockSession(overrides: {
  email?: string
  name?: string
  role?: string
} = {}) {
  return {
    user: {
      email: overrides.email ?? 'admin@test.com',
      name: overrides.name ?? 'Admin User',
      role: overrides.role ?? 'admin',
    },
    expires: new Date(Date.now() + 86400_000).toISOString(),
  }
}

/** Parse the JSON body of a NextResponse. */
export async function parseJson(response: Response): Promise<unknown> {
  return response.json()
}
