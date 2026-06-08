import { Hono } from 'hono'
import db from '../db-register.js'
import { authMiddleware } from '../middleware.js'
import fs from 'fs'
import path from 'path'

const files = new Hono<{ Variables: { user: any } }>()

const UPLOAD_DIR = './uploads'
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR)

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

files.post('/upload', authMiddleware, async (c) => {
  const user = c.get('user')
  const formData = await c.req.formData()
  const file = formData.get('file') as File

  if (!file) return c.text('no file', 400)
  if (!ALLOWED_TYPES.includes(file.type)) return c.text('invalid file type', 400)
  if (file.size > MAX_SIZE) return c.text('file too large', 400)

  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filepath = path.join(UPLOAD_DIR, filename)

  const buffer = await file.arrayBuffer()
  fs.writeFileSync(filepath, Buffer.from(buffer))

  db.prepare('INSERT INTO files (user_id, filename, original_name, size, mime_type) VALUES (?, ?, ?, ?, ?)')
    .run(user.id, filename, file.name, file.size, file.type)

  return c.json({ filename, url: `/files/${filename}` })
})

files.get('/files/:filename', (c) => {
  const filename = c.req.param('filename')
  const filepath = path.join('./uploads', filename)
  
  if (!fs.existsSync(filepath)) return c.text('not found', 404)

  const file = db.prepare('SELECT * FROM files WHERE filename = ?').get(filename) as any
  
  // avatary su verejne
  if (filename.startsWith('avatar-')) {
    const data = fs.readFileSync(filepath)
    const ext = filename.split('.').pop()
    const mimeTypes: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
    return new Response(data, {
      headers: { 'Content-Type': mimeTypes[ext!] || 'image/jpeg' },
    })
  }

  // ostatne subory len pre prihlasenych
  const authHeader = c.req.header('cookie')
  if (!file) return c.text('not found', 404)

  const data = fs.readFileSync(filepath)
  return new Response(data, {
    headers: { 'Content-Type': file.mime_type },
  })
})

files.get('/my-files', authMiddleware, (c) => {
  const user = c.get('user')
  const result = db.prepare('SELECT * FROM files WHERE user_id = ?').all(user.id)
  return c.json(result)
})

files.post('/upload/avatar', authMiddleware, async (c) => {
  const user = c.get('user')
  const formData = await c.req.formData()
  const file = formData.get('file') as File

  if (!file) return c.text('no file', 400)
  if (!ALLOWED_TYPES.includes(file.type)) return c.text('invalid file type', 400)
  if (file.size > MAX_SIZE) return c.text('file too large', 400)

  const ext = file.name.split('.').pop()
  const filename = `avatar-${user.id}-${Date.now()}.${ext}`
  const filepath = path.join(UPLOAD_DIR, filename)

  const buffer = await file.arrayBuffer()
  fs.writeFileSync(filepath, Buffer.from(buffer))

  db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(filename, user.id)

  const updatedUser = db.prepare('SELECT id, username, email, role, avatar, created_at FROM users WHERE id = ?').get(user.id)
  return c.json(updatedUser)
})

export default files