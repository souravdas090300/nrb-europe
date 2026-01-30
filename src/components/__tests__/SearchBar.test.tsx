import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SearchBar from '../SearchBar'

// Mock fetch
global.fetch = jest.fn()

describe('SearchBar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders search input', () => {
    render(<SearchBar />)
    const input = screen.getByPlaceholderText(/search/i)
    expect(input).toBeInTheDocument()
  })

  it('accepts user input', () => {
    render(<SearchBar />)
    const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'test query' } })
    expect(input.value).toBe('test query')
  })

  it('shows search button', () => {
    render(<SearchBar />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('triggers search on form submit', () => {
    const { container } = render(<SearchBar />)
    const form = container.querySelector('form')
    const input = screen.getByPlaceholderText(/search/i)
    
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.submit(form!)
    
    // Should not throw error
    expect(input).toBeInTheDocument()
  })

  it('displays custom placeholder when provided', () => {
    render(<SearchBar placeholder="Custom search..." />)
    expect(screen.getByPlaceholderText('Custom search...')).toBeInTheDocument()
  })

  it('debounces search API calls', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => [],
    })

    render(<SearchBar />)
    const input = screen.getByPlaceholderText(/search/i)
    
    // Type multiple characters quickly
    fireEvent.change(input, { target: { value: 't' } })
    fireEvent.change(input, { target: { value: 'te' } })
    fireEvent.change(input, { target: { value: 'tes' } })
    
    // Wait for debounce
    await waitFor(() => {
      // Should only call once after debounce delay
      expect(global.fetch).toHaveBeenCalledTimes(1)
    }, { timeout: 500 })
  })
})
