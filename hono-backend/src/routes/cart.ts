import { Hono } from 'hono'
import db from '../db-register.js'
import { authMiddleware } from '../middleware.js'

type Variables = { user: any }
const cart = new Hono<{ Variables: Variables }>()

// GET kosik
cart.get('/cart', authMiddleware, (c) => {
  const user = c.get('user')
  const items = db.prepare(`
    SELECT ci.*, p.name, p.price, p.image, p.discount, p.stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `).all(user.id)
  return c.json(items)
})



// DELETE odstran z kosika
cart.delete('/cart/:productId', authMiddleware, (c) => {
  const user = c.get('user')
  const productId = parseInt(c.req.param('productId'))
  if (isNaN(productId)) return c.text('invalid id', 400)

  db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?')
    .run(user.id, productId)
  return c.text('ok')
})

// POST kup vsetko v kosiku
cart.post('/cart/checkout', authMiddleware, (c) => {
  const user = c.get('user')

  const items = db.prepare(`
    SELECT ci.*, p.stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `).all(user.id) as any[]

  if (items.length === 0) return c.text('cart is empty', 400)

  for (const item of items) {
    if (item.stock < item.quantity) {
      return c.text(`not enough stock for product ${item.product_id}`, 400)
    }
  }

  const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?')
  const deleteItem = db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?')

  const transaction = db.transaction(() => {
    for (const item of items) {
      updateStock.run(item.quantity, item.product_id)
      deleteItem.run(user.id, item.product_id)
    }
  })

  transaction()
  return c.text('ok')
})

// POST pridaj do kosika
cart.post('/cart/:productId', authMiddleware, (c) => {
  const user = c.get('user')
  const productId = parseInt(c.req.param('productId'))
  if (isNaN(productId)) return c.text('invalid id', 400)

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as any
  if (!product) return c.text('not found', 404)
  if (product.stock < 1) return c.text('out of stock', 400)

  try {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, 1)')
      .run(user.id, productId)
  } catch (e) {
    db.prepare('UPDATE cart_items SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?')
      .run(user.id, productId)
  }

  return c.text('ok')
})

export default cart