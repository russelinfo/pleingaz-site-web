// server.js
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import paymentRoutes from './routes/paymentRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import path from 'path'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

// Middleware global
app.use(cors())
app.use(express.json()) // ✅ classique pour toutes les routes JSON

// Routes
app.use('/api/payments', paymentRoutes)
app.use('/api/orders', orderRoutes)

app.use('/api/products', productRoutes)

// Route racine pour vérifier que le serveur fonctionne

app.get('/', (_req, res) => res.send('PleinGaz backend — payments API'))

// Servir les fichiers statiques de l'application React
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Pour toute autre requête non gérée par les routes API,
// renvoyer le fichier index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
