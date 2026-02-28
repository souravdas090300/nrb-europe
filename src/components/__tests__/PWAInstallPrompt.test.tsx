import '@testing-library/jest-dom'
import { render, screen, act } from '@testing-library/react'
import PWAInstallPrompt from '../pwa/PWAInstallPrompt'

function fireInstallPrompt() {
  const installEvent = new Event('beforeinstallprompt')
  Object.defineProperty(installEvent, 'preventDefault', { value: jest.fn() })
  act(() => {
    window.dispatchEvent(installEvent)
  })
}

describe('PWAInstallPrompt', () => {
  let matchMediaMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock matchMedia
    matchMediaMock = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))
    window.matchMedia = matchMediaMock

    // Clear localStorage
    localStorage.clear()
  })

  it('does not render initially (before beforeinstallprompt)', () => {
    const { container } = render(<PWAInstallPrompt />)
    expect(container.innerHTML).toBe('')
  })

  it('does not render when app is already installed (standalone mode)', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    const { container } = render(<PWAInstallPrompt />)
    expect(container.innerHTML).toBe('')
  })

  it('shows install prompt when beforeinstallprompt fires', () => {
    render(<PWAInstallPrompt />)

    fireInstallPrompt()

    expect(screen.getByText('Install NRB Europe')).toBeInTheDocument()
    expect(screen.getByText('Get quick access and read offline')).toBeInTheDocument()
    expect(screen.getByText('Install')).toBeInTheDocument()
    expect(screen.getByText('Not Now')).toBeInTheDocument()
  })

  it('hides prompt when dismiss is clicked', () => {
    render(<PWAInstallPrompt />)

    fireInstallPrompt()

    const dismissBtn = screen.getByText('Not Now')
    act(() => {
      dismissBtn.click()
    })

    expect(screen.queryByText('Install NRB Europe')).not.toBeInTheDocument()
  })

  it('stores dismissed state in localStorage', () => {
    render(<PWAInstallPrompt />)

    fireInstallPrompt()

    act(() => {
      screen.getByText('Not Now').click()
    })

    expect(localStorage.getItem('pwa-prompt-dismissed')).toBeTruthy()
  })
})
