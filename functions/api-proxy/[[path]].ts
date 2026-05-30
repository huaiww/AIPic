const UPSTREAM_BASE_URL = 'https://sub2api.simplaj.top/v1'

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
  headers.set('access-control-allow-headers', '*')
  headers.set('access-control-max-age', '86400')
  return headers
}

function buildUpstreamUrl(request: Request) {
  const url = new URL(request.url)
  const upstreamPath = url.pathname.replace(/^\/api-proxy\/?/, '')
  const upstreamUrl = new URL(`${UPSTREAM_BASE_URL}/${upstreamPath}`)
  upstreamUrl.search = url.search
  return upstreamUrl
}

function copyRequestHeaders(request: Request) {
  const headers = new Headers(request.headers)
  headers.delete('origin')
  headers.delete('host')
  for (const header of hopByHopHeaders) headers.delete(header)
  return headers
}

export const onRequest: PagesFunction = async ({ request }) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: withCors(new Headers()) })
  }

  const upstreamResponse = await fetch(buildUpstreamUrl(request), {
    method: request.method,
    headers: copyRequestHeaders(request),
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual',
  })

  const responseHeaders = new Headers(upstreamResponse.headers)
  for (const header of hopByHopHeaders) responseHeaders.delete(header)
  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: withCors(responseHeaders),
  })
}
