import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import ServiceWorkerRegistration from '../pwa/ServiceWorkerRegistration'

describe('ServiceWorkerRegistration', () => {
  const mockRegister = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockRegister.mockResolvedValue({
      scope: '/',
      addEventListener: jest.fn(),
    })
  })

  it('renders nothing (returns null)', () => {
    const { container } = render(<ServiceWorkerRegistration />)
    expect(container.innerHTML).toBe('')
  })

  it('does not register SW when NODE_ENV is not production', () => {
    // In Jest, NODE_ENV is 'test' — SW should NOT register
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register: mockRegister },
      configurable: true,
      writable: true,
    })

    render(<ServiceWorkerRegistration />)

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('does not error when serviceWorker is not in navigator', () => {
    // Simulate a browser without service worker support
    const original = navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      configurable: true,
      writable: true,
    })

    expect(() => render(<ServiceWorkerRegistration />)).not.toThrow()

    Object.defineProperty(navigator, 'serviceWorker', {
      value: original,
      configurable: true,
      writable: true,
    })
  })
})
