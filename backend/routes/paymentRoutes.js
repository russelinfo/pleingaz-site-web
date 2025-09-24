// routes/paymentRoutes.js
import express from 'express'
import fetch from 'node-fetch'
import crypto from 'crypto'
import dotenv from 'dotenv'
import prisma from '../prismaClient.js' // <-- import du client prisma

dotenv.config()
const router = express.Router()

/** helper signature verify (HMAC SHA256) */
function verifySignature(payload, signature, secret) {
  if (!signature || !secret) return false
  const hmac = crypto.createHmac('sha256', secret)
  const expected = hmac.update(payload).digest('hex')
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex')
    )
  } catch {
    return false
  }
}

/** POST /api/payments/initialize
 * body: { amount, currency?, name, email, phone, description? }
 */
router.post('/initialize', async (req, res) => {
  try {
    const {
      amount,
      currency = 'XAF',
      name,
      email,
      phone,
      description,
    } = req.body
    if (!amount || !email || !phone || !name) {
      return res
        .status(400)
        .json({ error: 'amount, name, email et phone sont requis' })
    }

    // 1) créer la transaction en DB (status pending)
    const reference = 'pleingaz-' + Date.now()
    const tx = await prisma.transaction.create({
      data: {
        reference,
        amount,
        currency,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        status: 'pending',
      },
    })

    // 2) Appel NotchPay
    const response = await fetch('https://api.notchpay.co/payments', {
      method: 'POST',
      headers: {
        Authorization: process.env.NOTCH_PUBLIC_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        customer: { name, email, phone },
        description: description || 'Paiement PleinGaz',
        callback:
          process.env.PAYMENT_CALLBACK_URL ||
          'https://pleingaz-site-web.onrender.com/api/payments/callback',
        reference, // utilise la même reference que la DB
      }),
    })

    const data = await response.json()
    console.log('✅ NotchPay response:', data)

    // 3) stocker la réponse NotchPay dans la DB (optionnel)
    await prisma.transaction.update({
      where: { reference },
      data: { notchData: data },
    })

    // Retourne la réponse NotchPay au front (ex: authorization_url)
    return res.json({ ...data, reference })
  } catch (err) {
    console.error('❌ Payment initialize error:', err)
    return res
      .status(500)
      .json({ error: "Erreur lors de l'initialisation du paiement" })
  }
})

/** GET /api/payments/verify/:reference
 * appel direct au service NotchPay pour vérifier l'état
 */
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params
    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: { Authorization: process.env.NOTCH_PUBLIC_KEY },
      }
    )
    const data = await response.json()
    console.log('✅ Payment verification:', data)

    // Si complete -> mettre à jour la BD
    const txRef =
      data.transaction?.merchant_reference ||
      data.transaction?.trxref ||
      data.transaction?.reference ||
      reference
    if (data.transaction?.status === 'complete' && txRef) {
      await prisma.transaction.updateMany({
        where: { reference: txRef },
        data: { status: 'complete', notchData: data },
      })
    }

    return res.json(data)
  } catch (err) {
    console.error('❌ Payment verify error:', err)
    return res
      .status(500)
      .json({ error: 'Erreur lors de la vérification du paiement' })
  }
})

/**
 * Webhook endpoint (NotchPay)
 * Important: faut accepter body RAW (express.raw) pour vérifier la signature.
 * Route : POST /api/payments/webhook/notchpay
 */
router.post(
  '/webhook/notchpay',
  express.raw({ type: 'application/json' }), // body raw
  async (req, res) => {
    try {
      const signature = req.headers['x-notch-signature']
      const payload = req.body ? req.body.toString('utf8') : ''
      const secret = process.env.NOTCHPAY_WEBHOOK_HASH

      // NotchPay dashboard test: parfois il envoie un ping sans signature.
      if (!signature) {
        console.log('🔎 Webhook test/validation reçu (pas de signature)')
        // répondre 200 rapidement (NotchPay attends 2xx)
        return res.status(200).send('Webhook endpoint verified')
      }

      // Vérifier la signature
      if (!verifySignature(payload, signature, secret)) {
        console.error('❌ Invalid webhook signature')
        return res.status(403).send('Invalid signature')
      }

      const event = JSON.parse(payload)
      console.log('📩 Webhook validé:', event)

      // récupérer la référence stockée (selon ce que NotchPay envoie)
      const ref =
        event?.data?.merchant_reference ||
        event?.data?.trxref ||
        event?.data?.reference ||
        event?.data?.trxRef

      if (event.type === 'payment.complete' && ref) {
        await prisma.transaction.updateMany({
          where: { reference: ref },
          data: { status: 'complete', notchData: event },
        })
        console.log('✅ Transaction mise à jour en complete pour', ref)
      } else if (event.type === 'payment.failed' && ref) {
        await prisma.transaction.updateMany({
          where: { reference: ref },
          data: { status: 'failed', notchData: event },
        })
        console.log('❌ Transaction mise à jour en failed pour', ref)
      }

      // Ack
      return res.status(200).send('Webhook reçu et validé')
    } catch (error) {
      console.error('Erreur Webhook:', error)
      // Toujours répondre 200 ou 500 selon ta stratégie ; NotchPay attend 2xx normalement.
      return res.status(500).send('Erreur serveur')
    }
  }
)

/** callback (utilisé quand l'utilisateur revient après paiement) */
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
    console.log('🔎 NotchPay verify response:', JSON.stringify(data, null, 2))

    // Si complete -> mettre à jour la DB
    const txRef =
      data.transaction?.merchant_reference ||
      data.transaction?.trxref ||
      data.transaction?.reference ||
      reference
    if (data.transaction?.status === 'complete' && txRef) {
      await prisma.transaction.updateMany({
        where: { reference: txRef },
        data: { status: 'complete', notchData: data },
      })
      return res.send('✅ Payment successful!')
    } else {
      return res.send('⚠️ Payment not completed.')
    }
  } catch (error) {
    console.error('❌ Error verifying payment:', error)
    return res.status(500).send('Error verifying payment')
  }
})

export default router
