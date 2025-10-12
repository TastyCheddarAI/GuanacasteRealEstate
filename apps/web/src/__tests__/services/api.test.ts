import { describe, it, expect, vi, beforeEach } from 'vitest'
import { aiAPI } from '../../services/api'

// Mock fetch globally
global.fetch = vi.fn()

describe('AI API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('makes correct API call for ask endpoint', async () => {
    const mockResponse = {
      answer: 'This is a test response',
      citations: []
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await aiAPI.ask('Test question')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/ai'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: expect.stringContaining('Test question')
      })
    )

    expect(result).toEqual(mockResponse)
  })

  it('handles API errors gracefully', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    })

    await expect(aiAPI.ask('Test question')).rejects.toThrow()
  })

  it('handles network errors', async () => {
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

    await expect(aiAPI.ask('Test question')).rejects.toThrow('Network error')
  })

  it('includes property ID when provided', async () => {
    const mockResponse = { answer: 'Property-specific response' }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    await aiAPI.ask('About this property', 'property-123')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('property-123')
      })
    )
  })
})