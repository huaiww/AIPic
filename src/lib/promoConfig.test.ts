import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PROMO_API_LABEL,
  DEFAULT_PROMO_API_URL,
  getPromoApiConfig,
  normalizePromoApiUrl,
} from './promoConfig'

describe('promo config', () => {
  it('uses default promo URL and label when not configured', () => {
    expect(getPromoApiConfig('', '')).toEqual({
      url: DEFAULT_PROMO_API_URL,
      displayUrl: DEFAULT_PROMO_API_URL,
      label: DEFAULT_PROMO_API_LABEL,
    })
  })

  it('normalizes custom promo URL without scheme', () => {
    expect(normalizePromoApiUrl('gateway.example.com')).toBe('https://gateway.example.com/')
  })

  it('uses custom promo URL and label', () => {
    expect(getPromoApiConfig('https://api.example.com/pricing', '我的中转站')).toEqual({
      url: 'https://api.example.com/pricing',
      displayUrl: 'https://api.example.com/pricing',
      label: '我的中转站',
    })
  })

  it('falls back to default URL for invalid protocols', () => {
    expect(getPromoApiConfig('javascript:alert(1)', '自定义')).toEqual({
      url: DEFAULT_PROMO_API_URL,
      displayUrl: DEFAULT_PROMO_API_URL,
      label: '自定义',
    })
  })
})
