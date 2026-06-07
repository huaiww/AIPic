import { readRuntimeEnv } from './runtimeEnv'

export const DEFAULT_PROMO_API_URL = 'https://sub2api.simplaj.top/'
export const DEFAULT_PROMO_API_LABEL = '稳定API中转站，注册送5刀，可免费修10张图'

export interface PromoApiConfig {
  url: string
  displayUrl: string
  label: string
}

export function normalizePromoApiUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const input = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const url = new URL(input)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return url.toString()
  } catch {
    return ''
  }
}

export function getPromoApiConfig(
  url = readRuntimeEnv(import.meta.env.VITE_PROMO_API_URL),
  label = readRuntimeEnv(import.meta.env.VITE_PROMO_API_LABEL),
): PromoApiConfig {
  const normalizedUrl = normalizePromoApiUrl(url) || DEFAULT_PROMO_API_URL
  const normalizedLabel = label.trim() || DEFAULT_PROMO_API_LABEL

  return {
    url: normalizedUrl,
    displayUrl: normalizedUrl,
    label: normalizedLabel,
  }
}

export const PROMO_API_CONFIG = getPromoApiConfig()
