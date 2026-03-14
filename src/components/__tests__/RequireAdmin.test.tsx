'use client'

import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import RequireAdmin from '../auth/RequireAdmin'

// Mock next-auth
const mockUseSession = jest.fn()
jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}))

// Mock next/navigation
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
  }),
}))

describe('RequireAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state while session is loading', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' })

    render(
      <RequireAdmin>
        <div>Admin Content</div>
      </RequireAdmin>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })

    render(
      <RequireAdmin>
        <div>Admin Content</div>
      </RequireAdmin>
    )

    expect(mockReplace).toHaveBeenCalledWith('/login?callbackUrl=/admin')
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('redirects to profile when user is not admin', () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: 'subscriber', email: 'user@test.com' } },
      status: 'authenticated',
    })

    render(
      <RequireAdmin>
        <div>Admin Content</div>
      </RequireAdmin>
    )

    expect(mockReplace).toHaveBeenCalledWith('/profile?error=admin_required')
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('renders children when user is admin', () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: 'admin', email: 'admin@test.com' } },
      status: 'authenticated',
    })

    render(
      <RequireAdmin>
        <div>Admin Content</div>
      </RequireAdmin>
    )

    expect(screen.getByText('Admin Content')).toBeInTheDocument()
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
