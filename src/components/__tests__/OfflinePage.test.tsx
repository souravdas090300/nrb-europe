import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import OfflinePage from '../../app/offline/page'

describe('Offline Page', () => {
  it('renders the offline message', () => {
    render(<OfflinePage />)
    expect(screen.getByText("You're Offline")).toBeInTheDocument()
  })

  it('displays connection lost description', () => {
    render(<OfflinePage />)
    expect(
      screen.getByText(/lost your internet connection/)
    ).toBeInTheDocument()
  })

  it('has a try again button', () => {
    render(<OfflinePage />)
    const button = screen.getByRole('button', { name: 'Try Again' })
    expect(button).toBeInTheDocument()
  })

  it('mentions cached articles availability', () => {
    render(<OfflinePage />)
    expect(
      screen.getByText(/cached articles may still be available/)
    ).toBeInTheDocument()
  })
})
