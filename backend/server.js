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

// ✅ Pour le webhook, on garde express.json() mais on récupère le raw body
app.use(
  '/api/payments/webhook',
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString('utf8') // ✅ Stocke le raw body comme string
    },
  })
)

// express.json() pour les autres routes
app.use(express.json())

// Routes
app.use('/api/payments', paymentRoutes)

app.get('/', (_req, res) => res.send('PleinGaz backend — payments API'))

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
