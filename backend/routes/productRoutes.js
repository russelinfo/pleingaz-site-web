// routes/productRoutes.js
import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()

// Route pour lister tous les produits
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany()
    return res.json(products)
  } catch (err) {
    console.error('Erreur lors de la récupération des produits:', err)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Route pour un produit spécifique par son ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const product = await prisma.product.findUnique({
      where: { id: id },
    })

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' })
    }
    return res.json(product)
  } catch (err) {
    console.error('Erreur lors de la récupération du produit:', err)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
