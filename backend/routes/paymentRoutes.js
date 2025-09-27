// routes/paymentRoutes.js
import express from 'express'
import fetch from 'node-fetch'
import crypto from 'crypto'
import dotenv from 'dotenv'
import prisma from '../prismaClient.js'

dotenv.config()
const router = express.Router()

/** helper signature verify (HMAC SHA256) */
function safeHexCompare(aHex, bHex) {
  try {
    const a = Buffer.from(aHex, 'hex')
    const b = Buffer.from(bHex, 'hex')
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
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
      'https://api.notchpay.co/payments',
      {
        method: 'POST',
        headers: {
          Authorization: `${process.env.NOTCH_PUBLIC_KEY}`,
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
        headers: { Authorization: `${process.env.NOTCH_PUBLIC_KEY}` },
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
  express.raw({ type: 'application/json' }), // IMPORTANT
  async (req, res) => {
    try {
      const signatureHeader = req.headers['x-notch-signature'] || ''
      const payloadRaw = req.body ? req.body.toString('utf8') : ''
      const secret = process.env.NOTCHPAY_WEBHOOK_HASH

      // Logs pour debug (supprime/masque en prod si sensible)
      console.log('--- WEBHOOK RAW ---')
      console.log('x-notch-signature header:', signatureHeader)
      console.log('payloadRaw:', payloadRaw)
      console.log('secret present?', !!secret)

      // Cas ping/test : NotchPay envoie parfois un body sans signature
      if (!signatureHeader) {
        console.log(
          '🔎 Webhook test/validation reçu (pas de signature). Ack 200.'
        )
        return res.status(200).send('Webhook endpoint verified')
      }

      // Si header a le préfixe 'sha256=' on l'enlève
      const signature = signatureHeader.startsWith('sha256=')
        ? signatureHeader.split('=')[1]
        : signatureHeader

      // Calcul HMAC SHA256 en hex
      const hmac = crypto.createHmac('sha256', secret || '')
      hmac.update(payloadRaw)
      const expected = hmac.digest('hex')

      if (!safeHexCompare(expected, signature)) {
        console.error(
          '❌ Invalid webhook signature — expected',
          expected,
          'got',
          signature
        )
        return res.status(403).send('Invalid signature')
      }

      const event = JSON.parse(payloadRaw)
      console.log('📩 Webhook validé:', event?.type, event?.data || '')

      // récupérer référence
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
        console.log('✅ Transaction mise à jour complete pour', ref)
      } else if (event.type === 'payment.failed' && ref) {
        await prisma.transaction.updateMany({
          where: { reference: ref },
          data: { status: 'failed', notchData: event },
        })
        console.log('❌ Transaction mise à jour failed pour', ref)
      } else {
        console.log(
          'ℹ️ Événement reçu sans ref connue ou non géré:',
          event.type
        )
      }

      return res.status(200).send('Webhook reçu et validé')
    } catch (err) {
      console.error('Erreur Webhook:', err)
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
          Authorization: `${process.env.NOTCH_PUBLIC_KEY}`,
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
