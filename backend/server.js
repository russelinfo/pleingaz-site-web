// server.js
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import paymentRoutes from './routes/paymentRoutes.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors())

// ⚠️ On applique express.json() seulement aux routes normales
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next() // on ne parse pas, laisser raw
  } else {
    express.json()(req, res, next)
  }
})

// Routes
app.use('/api/payments', paymentRoutes)

// Health
app.get('/', (_req, res) => res.send('PleinGaz backend — payments API'))

// Start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
