import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import * as z from 'zod'
import { sValidator } from '@hono/standard-validator'
import db from './db-register.js'
import bcrypt from 'bcrypt'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { authMiddleware, adminMiddleware } from './middleware.js'
import { createPinia } from 'pinia'

type Variables = {
  user: any
}

const app = new Hono<{ Variables: Variables }>()
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  
}))


// register
const registerSchema = z.object({
  username: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
})

app.post('/register', sValidator('json', registerSchema), async (c) => {
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

// login
const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

app.post('/login', sValidator('json', loginSchema), async (c) => {
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

// logout
app.post('/logout', (c) => {
  deleteCookie(c, 'session', { path: '/' })
  return c.text('ok')
})

// /me
app.get('/me', authMiddleware, (c) => {
  const user = c.get('user')
  const { password, ...userWithoutPassword } = user
  return c.json(userWithoutPassword)
})

app.get('/admin/users', adminMiddleware, (c) => {
  const users = db.prepare('SELECT id, username, email, role, created_at FROM users').all()
  return c.json(users)
})

// products
app.get('/products', (c) => {
  const category = c.req.query('category')

  if (category) {
    const products = db.prepare('SELECT * FROM products WHERE category = ?').all(category)
    return c.json(products)
  }

  const products = db.prepare('SELECT * FROM products').all()
  return c.json(products)
})

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  image: z.string().optional(),
  stock: z.number(),
  discount: z.number().min(0).max(100).default(0),
})

app.post('/products', adminMiddleware, sValidator('json', productSchema), async (c) => {
  const body = c.req.valid('json')

  db.prepare(`
    INSERT INTO products (name, description, price, category, image, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(body.name, body.description, body.price, body.category, body.image ?? null, body.stock)

  return c.text('ok')
})

app.get('/products/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id)

  if (!product) return c.text('not found', 404)

  return c.json(product)
})

// PATCH /products/:id - len admin
app.patch('/products/:id', adminMiddleware, sValidator('json', productSchema.partial()), async (c) => {
  const id = parseInt(c.req.param('id'))
  const body = c.req.valid('json')

  const fields = Object.entries(body)
    .map(([key]) => `${key} = ?`)
    .join(', ')
  const values = [...Object.values(body), id]

  db.prepare(`UPDATE products SET ${fields} WHERE id = ?`).run(...values)

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
  return c.json(product)
})

// DELETE /products/:id - len admin
app.delete('/products/:id', adminMiddleware, (c) => {
  const id = parseInt(c.req.param('id'))
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
  if (!product) return c.text('not found', 404)

  db.prepare('DELETE FROM products WHERE id = ?').run(id)
  return c.text('ok')
})


// PATCH /users/:id
const updateUserSchema = z.object({
  username: z.string().min(1).optional(),
  email: z.email().optional(),
})

app.patch('/users/:id', authMiddleware, sValidator('json', updateUserSchema), async (c) => {
  const id = parseInt(c.req.param('id'))
  const currentUser = c.get('user')
  const body = c.req.valid('json')

  if (currentUser.id !== id && currentUser.role !== 'admin') {
    return c.text('forbidden', 403)
  }

  if (body.username) {
    db.prepare('UPDATE users SET username = ? WHERE id = ?').run(body.username, id)
  }
  if (body.email) {
    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(body.email, id)
  }

  const user = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(id)
  return c.json(user)
})

app.delete('/users/:id', authMiddleware, (c) => {
  const id = parseInt(c.req.param('id'))
  const currentUser = c.get('user')

  if (currentUser.id !== id && currentUser.role !== 'admin') {
    return c.text('forbidden', 403)
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id)
  return c.text('ok')
})

app.delete('/admin/users/:id', adminMiddleware, (c) => {
  const id = parseInt(c.req.param('id'))
  db.prepare('DELETE FROM users WHERE id = ?').run(id)
  return c.text('ok')
})

// zmena role - len admin
app.patch('/admin/users/:id/role', adminMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'))
  const { role } = await c.req.json()

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id)
  return c.text('ok')
})

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)