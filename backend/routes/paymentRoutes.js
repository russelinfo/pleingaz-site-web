// routes/paymentRoutes.js
import express from 'express'
import fetch from 'node-fetch'
import crypto from 'crypto'
import dotenv from 'dotenv'
import prisma from '../prismaClient.js'

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
 * body: { amount, currency?, name, email, phone, orderId }
 */
router.post('/initialize', async (req, res) => {
  try {
    const { amount, email, phone, orderId } = req.body
    if (!amount || !email || !phone || !orderId) {
      return res
        .status(400)
        .json({ error: 'amount, email, phone et orderId sont requis' })
    } // 1) créer la transaction en DB

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        customerEmail: email,
        customerPhone: phone,
        orderId,
        status: 'pending',
        reference: crypto.randomUUID(),
      },
    }) // 2) Appel NotchPay

    const notchPayResponse = await fetch(
      'https://api.notchpay.co/payments/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NOTCH_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'XAF',
          reference: transaction.reference,
          phone,
          email,
          callback:
            'https://pleingaz-site-web.onrender.com/api/payments/callback',
        }),
      }
    )

    const notchPayData = await notchPayResponse.json()
    console.log('✅ NotchPay response:', JSON.stringify(notchPayData, null, 2)) // 3) Retourne la réponse NotchPay au front (ex: authorization_url)

    if (notchPayData.status) {
      res.json({
        success: true,
        authorization_url: notchPayData.authorization_url,
        reference: transaction.reference,
      })
    } else {
      console.error(
        "Échec de l'initialisation de NotchPay avec l'erreur:",
        notchPayData.message
      )
      res.status(500).json({
        success: false,
        message: "Échec de l'initialisation de NotchPay.",
      })
    }
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
        headers: { Authorization: `Bearer ${process.env.NOTCH_PUBLIC_KEY}` },
      }
    )
    const data = await response.json()
    console.log('✅ Payment verification:', data) // Si complete -> mettre à jour la BD

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

      if (!signature) {
        console.log('🔎 Webhook test/validation reçu (pas de signature)')
        return res.status(200).send('Webhook endpoint verified')
      }

      if (!verifySignature(payload, signature, secret)) {
        console.error('❌ Invalid webhook signature')
        return res.status(403).send('Invalid signature')
      }

      const event = JSON.parse(payload)
      console.log('📩 Webhook validé:', event)

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

      return res.status(200).send('Webhook reçu et validé')
    } catch (error) {
      console.error('Erreur Webhook:', error)
      return res.status(500).send('Erreur serveur')
    }
  }
)

/** callback (utilisé quand l'utilisateur revient après paiement) */
router.get('/callback', async (req, res) => {
  const reference = req.query.reference
  try {
    // ✅ CORRECTION : Vérification directe auprès de l'API de NotchPay
    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NOTCH_PUBLIC_KEY}`,
        },
      }
    )
    const data = await response.json()
    console.log('🔎 NotchPay verify response:', JSON.stringify(data, null, 2))

    if (data.transaction?.status === 'complete') {
      const txRef = data.transaction.merchant_reference || reference
      const transaction = await prisma.transaction.findUnique({
        where: { reference: txRef },
      })
      if (transaction?.status !== 'complete') {
        await prisma.transaction.update({
          where: { reference: txRef },
          data: { status: 'complete', notchData: data },
        })
        await prisma.order.update({
          where: { id: transaction.orderId },
          data: { status: 'paid' },
        })
      }
      return res.redirect(
        `https://pleingaz-site-web.vercel.app/order-confirmation?ref=${txRef}`
      )
    } else {
      return res.redirect(`https://pleingaz-site-web.vercel.app/cart`)
    }
  } catch (error) {
    console.error('❌ Erreur de vérification du paiement:', error)
    return res.redirect(`https://pleingaz-site-web.vercel.app/cart`)
  }
})

export default router
