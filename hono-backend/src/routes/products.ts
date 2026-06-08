import { Hono } from 'hono'
import * as z from 'zod'
import { sValidator } from '@hono/standard-validator'
import db from '../db-register.js'
import { adminMiddleware } from '../middleware.js'
import { notifyGlobalClients } from './sse.js'

const products = new Hono()

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  image: z.string().optional(),
  stock: z.number(),
  discount: z.number().min(0).max(100).default(0),
})

products.get('/', (c) => {
  const category = c.req.query('category')
  const search = c.req.query('search')

  let query = 'SELECT * FROM products WHERE 1=1'
  const params: any[] = []

  if (category) {
    query += ' AND category = ?'
    params.push(category)
  }

  if (search) {
    query += ' AND (name LIKE ?)'
    params.push(`%${search}%`)
  }

  const result = db.prepare(query).all(...params)
  return c.json(result)
})

products.get('/:id', (c) => {
  const id = parseInt(c.req.param('id'))
if (isNaN(id)) return c.text('invalid id', 400)
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
  if (!product) return c.text('not found', 404)
  return c.json(product)
})

products.post('/', adminMiddleware, sValidator('json', productSchema), async (c) => {
  const body = c.req.valid('json')
  db.prepare(`
    INSERT INTO products (name, description, price, category, image, stock, discount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(body.name, body.description, body.price, body.category, body.image ?? null, body.stock, body.discount ?? 0)
  notifyGlobalClients({ type: 'product_added' })
  return c.text('ok')
})

products.patch('/:id', adminMiddleware, sValidator('json', productSchema.partial()), async (c) => {
  const id = parseInt(c.req.param('id'))
if (isNaN(id)) return c.text('invalid id', 400)
  const body = c.req.valid('json')

  const fields = Object.entries(body).map(([key]) => `${key} = ?`).join(', ')
  const values = [...Object.values(body), id]

  db.prepare(`UPDATE products SET ${fields} WHERE id = ?`).run(...values)

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
  notifyGlobalClients({ type: 'product_updated' })
  return c.json(product)
})

products.delete('/:id', adminMiddleware, (c) => {
  const id = parseInt(c.req.param('id'))
if (isNaN(id)) return c.text('invalid id', 400)
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
  if (!product) return c.text('not found', 404)
  db.prepare('DELETE FROM products WHERE id = ?').run(id)
notifyGlobalClients({ type: 'product_deleted' })
  return c.text('ok')
})

export default products