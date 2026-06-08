import { Hono } from 'hono'
import db from '../db-register.js'
import { adminMiddleware } from '../middleware.js'

const admin = new Hono()

admin.get('/users', adminMiddleware, (c) => {
  const users = db.prepare('SELECT id, username, email, role, created_at FROM users').all()
  return c.json(users)
})

admin.delete('/users/:id', adminMiddleware, (c) => {
  const id = parseInt(c.req.param('id'))
if (isNaN(id)) return c.text('invalid id', 400)
  db.prepare('DELETE FROM users WHERE id = ?').run(id)
  return c.text('ok')
})

admin.patch('/users/:id/role', adminMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'))
if (isNaN(id)) return c.text('invalid id', 400)
  const { role } = await c.req.json()
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id)
  return c.text('ok')
})

export default admin