import { Hono } from 'hono'
import * as z from 'zod'
import { sValidator } from '@hono/standard-validator'
import db from '../db-register.js'
import { authMiddleware } from '../middleware.js'
import { notifyProductClients } from './sse.js'

type Variables = {
  user: any
}

const reviews = new Hono<{ Variables: Variables }>()

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().min(1),
})

const commentSchema = z.object({
  content: z.string().min(1),
})

// GET recenzie pre produkt
reviews.get('/products/:id/reviews', (c) => {
  const productId = parseInt(c.req.param('id'))

  const result = db.prepare(`
  SELECT r.*, u.username, u.avatar,
    (SELECT json_group_array(json_object(
      'id', c.id,
      'content', c.content,
      'created_at', c.created_at,
      'user_id', c.user_id,
      'username', cu.username,
      'avatar', cu.avatar
    ))
    FROM comments c
    JOIN users cu ON c.user_id = cu.id
    WHERE c.review_id = r.id
    ) as comments
  FROM reviews r
  JOIN users u ON r.user_id = u.id
  WHERE r.product_id = ?
  ORDER BY r.created_at DESC
`).all(productId)

  const parsed = result.map((r: any) => ({
    ...r,
    comments: JSON.parse(r.comments || '[]'),
  }))

  return c.json(parsed)
})

// v POST recenzia po úspešnom inserte
reviews.post('/products/:id/reviews', authMiddleware, sValidator('json', reviewSchema), (c) => {
  const productId = parseInt(c.req.param('id'))
  const user = c.get('user') as any
  const body = c.req.valid('json')

  try {
    db.prepare('INSERT INTO reviews (user_id, product_id, rating, content) VALUES (?, ?, ?, ?)')
      .run(user.id, productId, body.rating, body.content)

    notifyProductClients(String(productId), { type: 'review_added' })
    return c.text('ok')
  } catch (e) {
    return c.text('already reviewed', 409)
  }
})

// v POST komentar po úspešnom inserte
reviews.post('/reviews/:id/comments', authMiddleware, sValidator('json', commentSchema), (c) => {
  const reviewId = parseInt(c.req.param('id'))
  const user = c.get('user') as any
  const body = c.req.valid('json')

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId) as any
  db.prepare('INSERT INTO comments (user_id, review_id, content) VALUES (?, ?, ?)')
    .run(user.id, reviewId, body.content)

  notifyProductClients(String(review.product_id), { type: 'comment_added' })
  return c.text('ok')
})

// DELETE recenzia
reviews.delete('/reviews/:id', authMiddleware, (c) => {
  const id = parseInt(c.req.param('id'))
if (isNaN(id)) return c.text('invalid id', 400)
  const user = c.get('user') as any

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id) as any
  if (!review) return c.text('not found', 404)
  if (review.user_id !== user.id && user.role !== 'admin') return c.text('forbidden', 403)

  db.prepare('DELETE FROM reviews WHERE id = ?').run(id)
  notifyProductClients(String(review.product_id), { type: 'review_deleted' })
  return c.text('ok')
})

// DELETE komentar
reviews.delete('/comments/:id', authMiddleware, (c) => {
  const id = parseInt(c.req.param('id'))
if (isNaN(id)) return c.text('invalid id', 400)
  const user = c.get('user') as any

  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id) as any
  if (!comment) return c.text('not found', 404)
  if (comment.user_id !== user.id && user.role !== 'admin') return c.text('forbidden', 403)

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(comment.review_id) as any

  db.prepare('DELETE FROM comments WHERE id = ?').run(id)
  notifyProductClients(String(review.product_id), { type: 'comment_deleted' })
  return c.text('ok')
})

export default reviews