import express from 'express'
import session from 'express-session'
import passport from 'passport'
import path from 'path'
import { fileURLToPath } from 'url'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

// Middleware
app.use(express.json())
app.use(express.static(path.join(__dirname, '../dist/public')))

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// API routes
import authRoutes from './routes/auth.js'
import bookRoutes from './routes/books.js'
import userLibraryRoutes from './routes/userLibrary.js'
import membershipRoutes from './routes/memberships.js'
import reviewRoutes from './routes/reviews.js'

app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/user-library', userLibraryRoutes)
app.use('/api/memberships', membershipRoutes)
app.use('/api/reviews', reviewRoutes)

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/public/index.html'))
})

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('New WebSocket connection')
  
  ws.on('message', (message) => {
    console.log('Received:', message)
  })
  
  ws.on('close', () => {
    console.log('Client disconnected')
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 