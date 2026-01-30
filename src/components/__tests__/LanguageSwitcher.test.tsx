import { render, screen, fireEvent } from '@testing-library/react'
import LanguageSwitcher from '../LanguageSwitcher'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/en/news',
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('LanguageSwitcher', () => {
  it('renders language selector', () => {
    render(<LanguageSwitcher />)
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })

  it('displays all available languages', () => {
    render(<LanguageSwitcher />)
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(5) // en, bn, es, de, fr
  })

  it('shows current language as selected', () => {
    render(<LanguageSwitcher />)
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('en')
  })

  it('allows changing language', () => {
    const mockPush = jest.fn()
    const mockRouter = {
      push: mockPush,
    }
    
    // Override the mock for this test
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue(mockRouter)
    
    render(<LanguageSwitcher />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'bn' } })
    
    // The component should trigger navigation
    expect(mockPush).toHaveBeenCalled()
  })
})
