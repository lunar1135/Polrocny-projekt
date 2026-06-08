import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'

const sse = new Hono()

const productClients = new Map<string, Set<(data: string) => void>>()
const globalClients = new Set<(data: string) => void>()

export function notifyProductClients(productId: string, data: any) {
  productClients.get(productId)?.forEach(send => send(JSON.stringify(data)))
}

export function notifyGlobalClients(data: any) {
  globalClients.forEach(send => send(JSON.stringify(data)))
}

// SSE pre product page (recenzie)
sse.get('/products/:id/sse', (c) => {
  const productId = c.req.param('id')
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  const send = (data: string) => {
    writer.write(encoder.encode(`data: ${data}\n\n`))
  }

  if (!productClients.has(productId)) productClients.set(productId, new Set())
  productClients.get(productId)!.add(send)

  send(JSON.stringify({ type: 'connected' }))

  c.req.raw.signal.addEventListener('abort', () => {
    productClients.get(productId)?.delete(send)
    if (productClients.get(productId)?.size === 0) productClients.delete(productId)
    writer.close()
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
})

sse.get('/sse', (c) => {
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  const send = (data: string) => {
    writer.write(encoder.encode(`data: ${data}\n\n`))
  }

  globalClients.add(send)

  send(JSON.stringify({ type: 'connected' }))

  c.req.raw.signal.addEventListener('abort', () => {
    globalClients.delete(send)
    writer.close()
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
})

export default sse