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
app.use(express.json()) // ✅ classique pour toutes les routes JSON

// Routes
app.use('/api/payments', paymentRoutes)

app.get('/', (_req, res) => res.send('PleinGaz backend — payments API'))

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
