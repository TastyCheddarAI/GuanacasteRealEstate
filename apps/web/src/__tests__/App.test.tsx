import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders without crashing', () => {
    // Mock the document.getElementById to return a div
    const mockRoot = document.createElement('div')
    mockRoot.id = 'root'
    document.body.appendChild(mockRoot)

    // Spy on document.getElementById
    const originalGetElementById = document.getElementById
    document.getElementById = vi.fn((id) => {
      if (id === 'root') return mockRoot
      return originalGetElementById.call(document, id)
    })

    expect(() => {
      render(<App />)
    }).not.toThrow()

    // Cleanup
    document.body.removeChild(mockRoot)
    document.getElementById = originalGetElementById
  })

  it('App component exists', () => {
    expect(App).toBeDefined()
    expect(typeof App).toBe('function')
  })
})