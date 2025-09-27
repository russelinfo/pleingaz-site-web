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
const PORT = process.env.PORT || 5000

// Middleware pour gérer les requêtes CORS
app.use(
  cors({
    origin: 'https://pleingaz-site-web.vercel.app',
    credentials: true,
  })
)

// ⚠️ Important : ne pas parser JSON pour la route webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook/notchpay') {
    next() // on laisse express.raw() du fichier route gérer le body
  } else {
    express.json()(req, res, next) // sinon on parse en JSON normalement
  }
})

// Routes
app.use('/api/payments', paymentRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/emails', emailRoutes)
app.use('/api/products', productRoutes)

// Route racine
app.get('/', (_req, res) => res.send('PleinGaz backend — payments API'))

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
