// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors()); // utile si le front teste en local
app.use(express.json());

// Routes
app.use('/api/payments', paymentRoutes);

// Health
app.get('/', (_req, res) => res.send('PleinGaz backend — payments API'));

// Start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
