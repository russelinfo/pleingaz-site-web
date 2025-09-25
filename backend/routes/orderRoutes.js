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
// Nouvelle route pour récupérer les détails de la commande via la référence de transaction
router.get('/by-transaction/:reference', async (req, res) => {
  const { reference } = req.params
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { reference },
      include: { order: { include: { items: { include: { product: true } } } } },
    })

    if (!transaction || !transaction.order) {
      return res.status(404).json({ error: 'Commande non trouvée pour cette transaction' })
    }

    const order = transaction.order
    
    // Remap les items pour inclure les détails du produit
    const remappedItems = order.items.map(item => ({
      ...item,
      name: item.product.name,
      image: item.product.image,
      isGasBottle: item.product.isGasBottle,
      price: item.unitPrice,
    }));
    
    // Format des données pour correspondre à ce que le front attend
    const formattedOrder = {
      orderNumber: order.id,
      totalAmount: order.totalAmount,
      deliveryDate: order.deliveryDate,
      deliveryAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      items: remappedItems,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
    };
    
    res.json(formattedOrder)

  } catch (error) {
    console.error('Erreur lors de la récupération de la commande via la référence:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
