/* backend/routes/paymentRoutes.js */
import express from 'express'
import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch' // Node <18, sinon global fetch suffit
import crypto from 'crypto'

const router = express.Router()
const prisma = new PrismaClient()

/**
 * INITIALISER UN PAIEMENT
 */
router.post('/initialize', async (req, res) => {
  try {
    const { amount, phone, email, orderId } = req.body

    if (!amount || !phone || !email || !orderId) {
      return res
        .status(400)
        .json({ success: false, message: 'Champs manquants.' })
    }

    // Créer transaction locale
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        customerPhone: phone,
        customerEmail: email,
        orderId,
        status: 'pending',
        reference: crypto.randomUUID(),
      },
    })

    // Appel API NotchPay
    const notchPayResponse = await fetch(
      'https://api.notchpay.co/payments/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NOTCH_PUBLIC_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'XAF',
          reference: transaction.reference,
          phone,
          email,
          description: `Commande #${orderId}`,
          callback: "https://pleingaz-site-web.onrender.com/api/payments/callback",
        }),
      }
    )

    const notchPayData = await notchPayResponse.json()
    console.log('📡 Réponse NotchPay init:', notchPayData)

    if (notchPayData?.status === 'Accepted') {
      res.json({
        success: true,
        authorization_url: notchPayData.authorization_url,
      })
    } else {
      res.status(500).json({
        success: false,
        message: notchPayData?.message || 'Erreur NotchPay',
      })
    }
  } catch (err) {
    console.error('❌ Erreur init paiement:', err)
    res
      .status(500)
      .json({ success: false, message: 'Erreur serveur init paiement' })
  }
})

/**
 * CALLBACK (redirection utilisateur après paiement)
 */
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
    console.error('❌ Erreur callback:', error)
    return res.redirect(`https://pleingaz-site-web.vercel.app/cart`)
  }
})

/**
 * WEBHOOK (notification serveur → serveur de NotchPay)
 */
router.post('/webhook', async (req, res) => {
  try {
    const { reference, status } = req.body

    if (!reference) {
      return res
        .status(400)
        .json({ success: false, message: 'Référence manquante.' })
    }

    const transaction = await prisma.transaction.findUnique({
      where: { reference },
    })

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: 'Transaction introuvable.' })
    }

    if (status === 'complete') {
      await prisma.transaction.update({
        where: { reference },
        data: { status: 'complete', notchData: req.body },
      })
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: { status: 'paid' },
      })
    } else if (status === 'failed') {
      await prisma.transaction.update({
        where: { reference },
        data: { status: 'failed', notchData: req.body },
      })
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: { status: 'cancelled' },
      })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('❌ Erreur webhook:', error)
    res.status(500).json({ success: false, message: 'Erreur serveur webhook' })
  }
})

/**
 * VÉRIFICATION MANUELLE
 */
router.get('/verify/:reference', async (req, res) => {
  const { reference } = req.params
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
    res.json(notchPayData)
  } catch (err) {
    console.error('❌ Erreur verify:', err)
    res
      .status(500)
      .json({ success: false, message: 'Erreur serveur vérification' })
  }
})

export default router
