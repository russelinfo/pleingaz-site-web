// backend/routes/paymentRoutes.js
import express from 'express'
import fetch from 'node-fetch'
import crypto from 'crypto'
import dotenv from 'dotenv'
import prisma from '../prismaClient.js'

dotenv.config()
const router = express.Router()

/**
 * POST /api/payments/initialize
 * body: { amount, email, phone, orderId, paymentMethod }
 */
router.post('/initialize', async (req, res) => {
  try {
    let { amount, email, phone, orderId, paymentMethod } = req.body
    if (!amount || !email || !phone || !orderId || !paymentMethod) {
      return res.status(400).json({
        error: 'amount, email, phone, orderId et paymentMethod requis',
      })
    }

    // ✅ Normaliser le numéro en format +237
    if (!phone.startsWith('+237')) {
      phone = `+237${phone.replace(/^0+/, '')}`
    }

    // 1. Créer transaction en DB
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        customerEmail: email,
        customerPhone: phone,
        orderId,
        status: 'pending',
        reference: crypto.randomUUID(),
      },
    })

    // 2. Appel NotchPay
    const response = await fetch('https://api.notchpay.co/payments', {
      method: 'POST',
      headers: {
        Authorization: `${process.env.NOTCH_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'XAF',
        reference: transaction.reference,
        customer: { email, phone },
        payment_method: paymentMethod, // momo.mtn, momo.orange, card
        description: 'Paiement PleinGaz',
        callback:
          'https://pleingaz-site-web.onrender.com/api/payments/callback',
      }),
    })

    const data = await response.json()
    console.log('✅ NotchPay init response:', JSON.stringify(data, null, 2))

    // 3. Mise à jour transaction
    await prisma.transaction.update({
      where: { reference: transaction.reference },
      data: { notchData: data },
    })

    res.json({ success: true, reference: transaction.reference, notch: data })
  } catch (err) {
    console.error('❌ Payment initialize error:', err)
    res.status(500).json({ error: 'Erreur init paiement' })
  }
})

/** GET /api/payments/verify/:reference */
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params
    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: { Authorization: `${process.env.NOTCH_PUBLIC_KEY}` },
      }
    )
    const data = await response.json()
    console.log('✅ Payment verification:', data)

    if (data.transaction?.status) {
      await prisma.transaction.updateMany({
        where: { reference },
        data: { status: data.transaction.status, notchData: data },
      })
    }

    res.json(data)
  } catch (err) {
    console.error('❌ Payment verify error:', err)
    res.status(500).json({ error: 'Erreur vérification paiement' })
  }
})

/** Webhook NotchPay */
router.post(
  '/webhook/notchpay',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const event = JSON.parse(req.body.toString('utf8'))
      console.log('📩 Webhook reçu:', event)

      const ref =
        event?.data?.merchant_reference ||
        event?.data?.trxref ||
        event?.data?.reference

      if (event.type === 'payment.complete' && ref) {
        await prisma.transaction.updateMany({
          where: { reference: ref },
          data: { status: 'complete', notchData: event },
        })
        console.log('✅ Transaction complète:', ref)
      } else if (event.type === 'payment.failed' && ref) {
        await prisma.transaction.updateMany({
          where: { reference: ref },
          data: { status: 'failed', notchData: event },
        })
        console.log('❌ Transaction échouée:', ref)
      }

      res.status(200).send('OK')
    } catch (err) {
      console.error('❌ Webhook error:', err)
      res.status(500).send('Erreur Webhook')
    }
  }
)

export default router
