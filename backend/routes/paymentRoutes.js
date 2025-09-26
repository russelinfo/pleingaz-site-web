/* payment.js (backend) */
import express from 'express'
import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch' // Assurez-vous d'avoir node-fetch dans vos dépendances

const router = express.Router()
const prisma = new PrismaClient()

/**
 * Route pour initialiser un paiement avec NotchPay.
 */
router.post('/initialize', async (req, res) => {
  try {
    const { amount, phone, email, orderId } = req.body

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        phone,
        email,
        orderId,
        status: 'pending',
        reference: crypto.randomUUID(), // Utilisez une référence unique
      },
    })

    const response = await fetch(
      'https://api.notchpay.co/payments/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: process.env.NOTCH_SECRET_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'XAF',
          reference: transaction.reference,
          phone: phone,
          email: email,
          callback: `${process.env.BACKEND_URL}/api/payments/callback`, // L'URL de votre route de callback
        }),
      }
    )

    const data = await response.json()
    if (data.status) {
      res.json({ success: true, authorization_url: data.authorization_url })
    } else {
      res
        .status(500)
        .json({ success: false, message: 'NotchPay initialization failed' })
    }
  } catch (error) {
    console.error('Error initializing payment:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

/**
 * Route de callback après un paiement NotchPay.
 * Cette route est appelée par NotchPay.
 */
router.get('/callback', async (req, res) => {
  const reference = req.query.reference
  try {
    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: {
          Authorization: process.env.NOTCH_PUBLIC_KEY,
          'Content-Type': 'application/json',
        },
      }
    )
    const data = await response.json()

    const txRef = data.transaction?.merchant_reference || reference
    const transaction = await prisma.transaction.findUnique({
      where: { reference: txRef },
    })

    if (data.transaction?.status === 'complete' && transaction) {
      await prisma.transaction.update({
        where: { reference: txRef },
        data: { status: 'complete', notchData: data },
      })
      if (transaction.orderId) {
        await prisma.order.update({
          where: { id: transaction.orderId },
          data: { status: 'paid' },
        })
      }

      // ✅ Redirection directe vers le frontend sur Vercel
      // Utilisez une redirection HTTP standard
      return res.redirect(
        `https://pleingaz-site-web.vercel.app/order-confirmation?ref=${txRef}`
      )
    } else {
      // ✅ Redirection vers la page du panier en cas d'échec
      return res.redirect(`https://pleingaz-site-web.vercel.app/cart`)
    }
  } catch (error) {
    console.error('❌ Error verifying payment:', error)
    // ✅ Redirection vers la page du panier en cas d'erreur
    return res.redirect(`https://pleingaz-site-web.vercel.app/cart`)
  }
})

export default router
