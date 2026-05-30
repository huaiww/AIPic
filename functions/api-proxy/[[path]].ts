const UPSTREAM_BASE_URL = 'https://sub2api.simplaj.top/v1'
const UPSTREAM_HEADER = 'x-aipic-upstream'
const MAX_TEXT_BODY_CHARS = 8000

const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

function withCors(headers: Headers) {
  headers.set('access-control-allow-origin', '*')
  headers.set('access-control-allow-methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  headers.set('access-control-allow-headers', `*, ${UPSTREAM_HEADER}`)
  headers.set('access-control-max-age', '86400')
  return headers
}

function normalizeBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.trim()
  if (!trimmed) return ''

  const input = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const url = new URL(input)
    if (url.protocol !== 'https:') return ''

    const pathSegments = url.pathname.split('/').filter(Boolean)
    const v1Index = pathSegments.indexOf('v1')
    const normalizedSegments = v1Index >= 0
      ? pathSegments.slice(0, v1Index + 1)
      : pathSegments.length
        ? [...pathSegments, 'v1']
        : ['v1']
    return `${url.origin}/${normalizedSegments.join('/')}`
  } catch {
    return ''
  }
}

function getUpstreamBaseUrl(request: Request) {
  return normalizeBaseUrl(request.headers.get(UPSTREAM_HEADER) ?? '') || UPSTREAM_BASE_URL
}

function buildUpstreamUrl(request: Request) {
  const url = new URL(request.url)
  const upstreamPath = url.pathname.replace(/^\/api-proxy\/?/, '')
  const upstreamUrl = new URL(`${getUpstreamBaseUrl(request).replace(/\/+$/, '')}/${upstreamPath}`)
  upstreamUrl.search = url.search
  return upstreamUrl
}

function copyRequestHeaders(request: Request) {
  const headers = new Headers(request.headers)
  headers.delete('origin')
  headers.delete('host')
  headers.delete(UPSTREAM_HEADER)
  for (const header of hopByHopHeaders) headers.delete(header)
  return headers
}

export const onRequest: PagesFunction = async ({ request }) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: withCors(new Headers()) })
  }

  const upstreamUrl = buildUpstreamUrl(request)
  let upstreamResponse: Response
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: copyRequestHeaders(request),
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
    })
  } catch (error) {
    const headers = withCors(new Headers({ 'content-type': 'application/json; charset=utf-8' }))
    return new Response(JSON.stringify({
      error: {
        message: 'API 代理无法连接上游服务',
        upstream: upstreamUrl.origin,
        detail: error instanceof Error ? error.message : String(error),
      },
    }), { status: 502, headers })
  }

  const responseHeaders = new Headers(upstreamResponse.headers)
  for (const header of hopByHopHeaders) responseHeaders.delete(header)

  if (!upstreamResponse.ok && !responseHeaders.get('content-type')) {
    const text = await upstreamResponse.text()
    const headers = withCors(new Headers({ 'content-type': 'application/json; charset=utf-8' }))
    return new Response(JSON.stringify({
      error: {
        message: `上游接口返回 HTTP ${upstreamResponse.status}`,
        upstream: upstreamUrl.origin,
        status: upstreamResponse.status,
        body: text.slice(0, MAX_TEXT_BODY_CHARS),
      },
    }), {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    })
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: withCors(responseHeaders),
  })
}
