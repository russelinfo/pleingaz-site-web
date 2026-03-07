// server.js
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import paymentRoutes from './routes/paymentRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import emailRoutes from './routes/emailRoutes.js'

dotenv.config()
const app = express()

// ✅ Port dynamique pour Railway (sinon 5000 en local)
const PORT = process.env.PORT || 5000

// ✅ CORS : autoriser ton frontend hébergé sur Vercel
app.use(
  cors({
    origin: 'https://monpleingaz.com',
    credentials: true,
  }),
)

// ⚠️ Important : ne pas parser JSON pour la route webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook/notchpay') {
    next() // express.raw() dans la route gère le body
  } else {
    express.json()(req, res, next) // sinon, parser normalement
  }
})

// ✅ Routes principales
app.use('/api/payments', paymentRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/emails', emailRoutes)
app.use('/api/products', productRoutes)

// ✅ Route racine
app.get('/', (_req, res) => res.send('PleinGaz backend — payments API'))

// ✅ Correction : écouter sur 0.0.0.0 (pas localhost)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
