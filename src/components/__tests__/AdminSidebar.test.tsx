import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import AdminSidebar from '../layout/AdminSidebar'

// Mock next-auth
const mockSignOut = jest.fn()
jest.mock('next-auth/react', () => ({
  signOut: () => mockSignOut(),
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
})

describe('AdminSidebar', () => {
  it('renders the admin title', () => {
    render(<AdminSidebar><div>Content</div></AdminSidebar>)
    expect(screen.getByText('NRB Europe Admin')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<AdminSidebar><div>Content</div></AdminSidebar>)

    expect(screen.getByText(/Dashboard/)).toBeInTheDocument()
    expect(screen.getByText(/Users/)).toBeInTheDocument()
    expect(screen.getByText(/Subscriptions/)).toBeInTheDocument()
    expect(screen.getByText(/Settings/)).toBeInTheDocument()
    expect(screen.getByText(/Content Studio/)).toBeInTheDocument()
  })

  it('renders correct links for navigation items', () => {
    render(<AdminSidebar><div>Content</div></AdminSidebar>)

    const dashboardLink = screen.getByText(/Dashboard/).closest('a')
    expect(dashboardLink).toHaveAttribute('href', '/admin')

    const usersLink = screen.getByText(/Users/).closest('a')
    expect(usersLink).toHaveAttribute('href', '/admin/users')

    const subscriptionsLink = screen.getByText(/Subscriptions/).closest('a')
    expect(subscriptionsLink).toHaveAttribute('href', '/admin/subscriptions')

    const settingsLink = screen.getByText(/Settings/).closest('a')
    expect(settingsLink).toHaveAttribute('href', '/admin/settings')

    const studioLink = screen.getByText(/Content Studio/).closest('a')
    expect(studioLink).toHaveAttribute('href', '/studio')
  })

  it('has a sign out button', () => {
    render(<AdminSidebar><div>Content</div></AdminSidebar>)
    const signOutBtn = screen.getByText(/Sign Out/)
    expect(signOutBtn).toBeInTheDocument()
  })

  it('calls signOut when sign out button is clicked', () => {
    render(<AdminSidebar><div>Content</div></AdminSidebar>)
    const signOutBtn = screen.getByText(/Sign Out/)
    fireEvent.click(signOutBtn)
    expect(mockSignOut).toHaveBeenCalled()
  })

  it('renders children in main content area', () => {
    render(<AdminSidebar><div data-testid="child">Main Content</div></AdminSidebar>)
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Main Content')).toBeInTheDocument()
  })
})
