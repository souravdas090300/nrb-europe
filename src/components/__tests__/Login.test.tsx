import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '../../app/login/page'

// Mock next-auth
const mockSignIn = jest.fn()
jest.mock('next-auth/react', () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
}))

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
})

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the login form', () => {
    render(<Login />)
    expect(screen.getByText((content, element) => {
      return element !== null && /Sign In/i.test(content) && element.tagName === 'H1'
    })).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('renders back to home link', () => {
    render(<Login />)
    const link = screen.getByText('Back to Home')
    expect(link).toHaveAttribute('href', '/')
  })

  it('allows typing in email and password fields', () => {
    render(<Login />)

    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput.value).toBe('admin@test.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('calls signIn with credentials on form submit', async () => {
    mockSignIn.mockResolvedValue({ ok: true })

    render(<Login />)

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitBtn = screen.getByRole('button', { name: 'Sign In' })

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'admin@test.com',
        password: 'password123',
        redirect: false,
      })
    })
  })

  it('redirects to /admin on successful login', async () => {
    mockSignIn.mockResolvedValue({ ok: true })

    render(<Login />)

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'admin@test.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin')
    })
  })

  it('shows error message on failed login', async () => {
    mockSignIn.mockResolvedValue({ error: 'CredentialsSignIn', ok: false })

    render(<Login />)

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'wrong@test.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })
  })

  it('shows error message on exception', async () => {
    mockSignIn.mockRejectedValue(new Error('Network error'))

    render(<Login />)

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'admin@test.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument()
    })
  })

  it('shows loading state while signing in', async () => {
    let resolveSignIn: (value: any) => void
    mockSignIn.mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve
      })
    )

    render(<Login />)

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'admin@test.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument()
    })

    // Resolve the promise to clean up
    resolveSignIn!({ ok: true })
  })
})
