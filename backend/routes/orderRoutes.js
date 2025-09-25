// backend/routes/orderRoutes.js
import express from 'express'
import prisma from '../prismaClient.js'

const router = express.Router()

/**
 * POST /api/orders
 * body attendu : {
 *   customerName, customerEmail, customerPhone, deliveryAddress,
 *   paymentMethod, items: [{ productId, quantity, unitPrice }]
 * }
 */
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      paymentMethod,
      items,
    } = req.body

    if (!customerName || !customerEmail || !customerPhone || !deliveryAddress) {
      return res.status(400).json({ error: 'Infos client manquantes' })
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Aucun article dans la commande' })
    }

    // calcul du total
    const totalAmount = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    )

    // création de la commande avec items liés
    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        paymentMethod,
        totalAmount,
        status: 'pending',
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true },
    })

    res.json(order)
  } catch (err) {
    console.error('❌ Error creating order:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
