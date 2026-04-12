import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import * as z from 'zod'
import { sValidator } from '@hono/standard-validator'
import db from './db-register.js'

const app = new Hono()
app.use(cors())

const users = ['Martin', 'Stefan', 'Robert', 'Maros']

app.get('/users', (c) => {
  return c.json(users)
})

app.get('/users/:id', (c) => {
  const id = parseInt(c.req.param('id'))

  if (Number.isNaN(id)) {
    return c.text('Napisal si chujovinu')
  }

  return c.text(users[id])
})

const schema = z.object({
  newUsername: z.email(),
})

app.post('/users', sValidator('json', schema), async (c) => {
  const body = c.req.valid('json')
  users.push(body.newUsername)
  return c.text('ok')
})

app.delete('/users/:id', (c) => {
  const id = parseInt(c.req.param('id'))

  if (Number.isNaN(id)) {
    return c.text('Napisal si chujovinu')
  }

  users.splice(id, 1)

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

//register
const registerSchema = z.object({
  username: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
})

app.post('/register', sValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json')

  try {
    db.prepare('INSERT INTO users (email, username, password) VALUES (?, ?, ?)')
      .run(body.email, body.username, body.password)

    return c.text('ok')
  } catch (e) {
    return c.text('email already exists', 409)
  }
})

//login

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

app.post('/login', sValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json')

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?')
    .get(body.email, body.password)

  if (!user) {
    return c.text('invalid credentials', 401)
  }

  return c.json(user)
})
