import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import Providers from '../auth/Providers'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}))

describe('Providers', () => {
  it('renders children', () => {
    const { getByText } = render(
      <Providers>
        <div>Test Child</div>
      </Providers>
    )
    expect(getByText('Test Child')).toBeInTheDocument()
  })

  it('wraps children in SessionProvider', () => {
    const { getByTestId } = render(
      <Providers>
        <div>Test Child</div>
      </Providers>
    )
    expect(getByTestId('session-provider')).toBeInTheDocument()
  })
})
