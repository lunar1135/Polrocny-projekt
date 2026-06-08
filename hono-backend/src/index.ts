import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import userRoutes from './routes/users.js'
import adminRoutes from './routes/admin.js'
import reviewRoutes from './routes/reviews.js'
import sseRoutes from './routes/sse.js'
import fileRoutes from './routes/files.js'
import cartRoutes from './routes/cart.js'


type Variables = {
  user: any
}

const app = new Hono<{ Variables: Variables }>()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

app.route('/', authRoutes)
app.route('/products', productRoutes)
app.route('/users', userRoutes)
app.route('/admin', adminRoutes)
app.route('/', reviewRoutes)
app.route('/', sseRoutes)
app.route('/', fileRoutes)
app.route('/', cartRoutes)

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)