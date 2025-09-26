/* backend/routes/paymentRoutes.js */
import express from 'express'
import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch' // Assurez-vous d'avoir node-fetch

const router = express.Router()
const prisma = new PrismaClient()

router.post('/initialize', async (req, res) => {
  try {
    const { amount, phone, email, orderId } = req.body

    if (!amount || !phone || !email || !orderId) {
      console.error('Données de paiement manquantes:', req.body)
      return res
        .status(400)
        .json({ success: false, message: 'Données de paiement manquantes.' })
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        phone,
        email,
        orderId,
        status: 'pending',
        reference: crypto.randomUUID(),
      },
    })

    const notchPayResponse = await fetch(
      'https://api.notchpay.co/payments/initialize',
      {
        method: 'POST',
        headers: {
          // ✅ CORRECTION MAJEURE: Ajouter le préfixe 'Bearer '
          Authorization: `Bearer ${process.env.NOTCH_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'XAF',
          reference: transaction.reference,
          phone: phone,
          email: email,
          callback: `${process.env.BACKEND_URL}/api/payments/callback`,
        }),
      }
    )

    const notchPayData = await notchPayResponse.json()
    // ✅ Ajout des logs pour le débogage. VÉRIFIEZ CE LOG SUR RENDER!
    console.log(
      'Réponse complète de NotchPay:',
      JSON.stringify(notchPayData, null, 2)
    )

    if (notchPayData.status) {
      res.json({
        success: true,
        authorization_url: notchPayData.authorization_url,
      })
    } else {
      console.error(
        "Échec de l'initialisation de NotchPay avec l'erreur:",
        notchPayData.message
      )
      res
        .status(500)
        .json({
          success: false,
          message: "Échec de l'initialisation de NotchPay.",
        })
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation du paiement:", error)
    res
      .status(500)
      .json({
        success: false,
        message: "Erreur serveur lors de l'initialisation du paiement.",
      })
  }
})

router.get('/callback', async (req, res) => {
  const reference = req.query.reference
  try {
    const notchPayResponse = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NOTCH_PUBLIC_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    const notchPayData = await notchPayResponse.json()
    const txRef = notchPayData.transaction?.merchant_reference || reference

    const transaction = await prisma.transaction.findUnique({
      where: { reference: txRef },
    })

    if (notchPayData.transaction?.status === 'complete' && transaction) {
      await prisma.transaction.update({
        where: { reference: txRef },
        data: { status: 'complete', notchData: notchPayData },
      })
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: { status: 'paid' },
      })
      return res.redirect(
        `https://pleingaz-site-web.vercel.app/order-confirmation?ref=${txRef}`
      )
    } else {
      return res.redirect(`https://pleingaz-site-web.vercel.app/cart`)
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du paiement:', error)
    return res.redirect(`https://pleingaz-site-web.vercel.app/cart`)
  }
})

export default router
