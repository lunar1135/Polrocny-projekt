import { Hono } from 'hono'
import * as z from 'zod'
import { sValidator } from '@hono/standard-validator'
import db from '../db-register.js'
import { authMiddleware } from '../middleware.js'

type AuthUser = { id: number; role: string }

const users = new Hono()

const updateUserSchema = z.object({
  username: z.string().min(1).optional(),
  email: z.string().email().optional(),
})

users.patch('/:id', authMiddleware, sValidator('json', updateUserSchema), async (c) => {
  const id = parseInt(c.req.param('id'))
if (isNaN(id)) return c.text('invalid id', 400)
  const currentUser = c.get('user' as never) as AuthUser
  const body = c.req.valid('json')

  if (currentUser.id !== id && currentUser.role !== 'admin') {
    return c.text('forbidden', 403)
  }

  if (body.username) db.prepare('UPDATE users SET username = ? WHERE id = ?').run(body.username, id)
  if (body.email) db.prepare('UPDATE users SET email = ? WHERE id = ?').run(body.email, id)

  const user = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(id)
  return c.json(user)
})

users.delete('/:id', authMiddleware, (c) => {
  const id = parseInt(c.req.param('id'))
if (isNaN(id)) return c.text('invalid id', 400)
  const currentUser = c.get('user' as never) as AuthUser

  if (currentUser.id !== id && currentUser.role !== 'admin') {
    return c.text('forbidden', 403)
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id)
  return c.text('ok')
})

users.get('/:id/public', (c) => {
  const id = parseInt(c.req.param('id'))
if (isNaN(id)) return c.text('invalid id', 400)
  const user = db.prepare('SELECT id, username, avatar, created_at FROM users WHERE id = ?').get(id)
  if (!user) return c.text('not found', 404)
  return c.json(user)
})

export default users