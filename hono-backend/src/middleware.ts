import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import db from './db-register.js'

export const authMiddleware = createMiddleware(async (c, next) => {
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return c.text('unauthorized', 401)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(sessionId) as any
  if (!user) return c.text('unauthorized', 401)

  c.set('user', user)
  await next()
})

export const adminMiddleware = createMiddleware(async (c, next) => {
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return c.text('unauthorized', 401)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(sessionId) as any
  if (!user) return c.text('unauthorized', 401)
  if (user.role !== 'admin') return c.text('forbidden', 403)

  c.set('user', user)
  await next()
})