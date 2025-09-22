// server.js
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import paymentRoutes from './routes/paymentRoutes.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

// Middleware global
app.use(cors())

// ✅ IMPORTANT: Webhook AVANT express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))

// Puis express.json() pour les autres routes
app.use(express.json())

// Routes
app.use('/api/payments', paymentRoutes)

app.get('/', (_req, res) => res.send('PleinGaz backend — payments API'))

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
