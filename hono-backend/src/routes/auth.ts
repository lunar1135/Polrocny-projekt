import { Hono } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import * as z from 'zod'
import { sValidator } from '@hono/standard-validator'
import bcrypt from 'bcrypt'
import db from '../db-register.js'
import { authMiddleware } from '../middleware.js'

const auth = new Hono()

const registerSchema = z.object({
  username: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
})

auth.post('/register', sValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json')
  try {
    const hashedPassword = await bcrypt.hash(body.password, 10)
    db.prepare('INSERT INTO users (email, username, password) VALUES (?, ?, ?)')
      .run(body.email, body.username, hashedPassword)
    return c.text('ok')
  } catch (e) {
    return c.text('email already exists', 409)
  }
})

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

auth.post('/login', sValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json')
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(body.email) as any
  if (!user) return c.text('invalid credentials', 401)

  const match = await bcrypt.compare(body.password, user.password)
  if (!match) return c.text('invalid credentials', 401)

  setCookie(c, 'session', String(user.id), {
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  const { password, ...userWithoutPassword } = user
  return c.json(userWithoutPassword)
})

auth.post('/logout', (c) => {
  deleteCookie(c, 'session', { path: '/' })
  return c.text('ok')
})

auth.get('/me', authMiddleware, (c) => {
  const user = c.get('user' as never) as any
  const { password, ...userWithoutPassword } = user
  return c.json(userWithoutPassword)
})

export default auth