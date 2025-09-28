// backend/routes/paymentRoutes.js
import express from 'express'
import fetch from 'node-fetch'
import crypto from 'crypto'
import dotenv from 'dotenv'
import prisma from '../prismaClient.js'

dotenv.config()
const router = express.Router()

/**
 * Safe timing-safe hex compare
 */
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

/**
 * Format phone for Cameroon: ensure +237... (keeps existing + if provided)
 */
function formatPhoneCameroon(raw) {
  if (!raw) return raw
  let s = String(raw)
    .replace(/[^0-9+]/g, '')
    .trim()
  if (s.startsWith('0')) s = s.slice(1)
  if (s.startsWith('237') && !s.startsWith('+')) s = `+${s}`
  if (!s.startsWith('+237')) {
    if (s.startsWith('+')) {
      // keep as is
    } else {
      s = `+237${s}`
    }
  }
  s = s.replace(/^\+\+/, '+')
  return s
}

/**
 * POST /api/payments/initialize
 * Version corrigée sans canaux spécifiques
 */
router.post('/initialize', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      paymentMethod,
      items,
      totalAmount,
    } = req.body

    if (!customerName || !customerEmail || !customerPhone || !deliveryAddress) {
      return res.status(400).json({ error: 'Infos client manquantes' })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Aucun article fourni' })
    }

    // 1) Créer la commande
    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        paymentMethod: paymentMethod || 'cash',
        totalAmount:
          totalAmount ||
          items.reduce((s, it) => s + it.unitPrice * it.quantity, 0),
        status: paymentMethod === 'cash' ? 'pending' : 'pending',
        items: {
          create: items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
        },
      },
    })

    // Pour cash on delivery
    if (!paymentMethod || paymentMethod === 'cash') {
      return res.json({
        success: true,
        orderId: order.id,
        payment: { method: 'cash', status: 'pending' },
      })
    }

    // 2) Créer transaction
    const merchantReference = crypto.randomUUID()
    let transaction = await prisma.transaction.create({
      data: {
        reference: merchantReference,
        status: 'pending',
        amount: totalAmount || order.totalAmount,
        customerName,
        customerEmail,
        customerPhone: formatPhoneCameroon(customerPhone),
        orderId: order.id,
      },
    })

    // 3) Configuration NotchPay - VERSION CORRIGÉE
    let notchBody = {
      amount: transaction.amount,
      currency: 'XAF',
      reference: merchantReference,
      phone: transaction.customerPhone,
      email: transaction.customerEmail,
      description: `Commande PleinGaz #${order.id}`,
      callback: 'https://pleingaz-site-web.onrender.com/api/payments/callback',
    }

    // Configuration selon le type de paiement - SIMPLIFIÉ
    if (paymentMethod === 'momo.mtn' || paymentMethod === 'momo.orange') {
      notchBody.payment_method = 'mobile_money'
      // Pas de canal spécifique pour éviter l'erreur 500
    } else if (paymentMethod === 'card') {
      notchBody.payment_method = 'card'
    }

    console.log('NotchPay request:', JSON.stringify(notchBody, null, 2))

    const notchResponse = await fetch('https://api.notchpay.co/payments', {
      method: 'POST',
      headers: {
        Authorization: `${process.env.NOTCH_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notchBody),
    })

    const notchData = await notchResponse.json()
    console.log('NotchPay response:', JSON.stringify(notchData, null, 2))

    if (!notchResponse.ok || notchData.code !== 201) {
      throw new Error(notchData.message || 'Erreur NotchPay')
    }

    // Mise à jour transaction avec référence NotchPay
    const notchTxRef = notchData?.transaction?.reference || notchData?.reference
    if (notchTxRef) {
      transaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          reference: notchTxRef,
          notchData: notchData,
        },
      })
    } else {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { notchData: notchData },
      })
    }

    // Réponse selon le type de flux
    const response = {
      success: true,
      orderId: order.id,
      reference: transaction.reference,
      notchResponse: notchData,
    }

    // Si authorization_url présente -> redirection nécessaire
    if (notchData.authorization_url) {
      response.paymentType = 'redirect'
      response.authorization_url = notchData.authorization_url
      response.message = 'Redirection vers NotchPay requise'
    } else {
      // Flux direct (quand compte sera activé)
      response.paymentType = 'direct'
      response.message = 'Paiement initialisé en mode direct'
      if (notchData.ussd_code) {
        response.ussdCode = notchData.ussd_code
      }
    }

    return res.json(response)
  } catch (err) {
    console.error('Payment initialize error:', err)
    return res.status(500).json({
      error: "Erreur lors de l'initialisation",
      details: err.message,
    })
  }
})

/**
 * GET /api/payments/verify/:reference
 * Vérification du statut de paiement
 */
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params
    if (!reference) {
      return res.status(400).json({ error: 'Référence manquante' })
    }

    const verifyResponse = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: { Authorization: `${process.env.NOTCH_PUBLIC_KEY}` },
      }
    )
    const data = await verifyResponse.json()
    console.log('Payment verification:', JSON.stringify(data, null, 2))

    const txRef = data.transaction?.reference || reference
    const status = data.transaction?.status

    // Mise à jour de la base de données selon le statut
    if (status === 'complete') {
      await prisma.transaction.updateMany({
        where: { reference: txRef },
        data: { status: 'complete', notchData: data },
      })

      const tx = await prisma.transaction.findFirst({
        where: { reference: txRef },
      })
      if (tx?.orderId) {
        await prisma.order.update({
          where: { id: tx.orderId },
          data: { status: 'paid' },
        })
      }
    } else if (
      status === 'failed' ||
      status === 'canceled' ||
      status === 'abandoned'
    ) {
      await prisma.transaction.updateMany({
        where: { reference: txRef },
        data: { status: 'failed', notchData: data },
      })

      const tx = await prisma.transaction.findFirst({
        where: { reference: txRef },
      })
      if (tx?.orderId) {
        await prisma.order.update({
          where: { id: tx.orderId },
          data: { status: 'failed' },
        })
      }
    }

    return res.json({
      status: status || 'unknown',
      message: data.message || null,
      data,
    })
  } catch (err) {
    console.error('Payment verify error:', err)
    return res.status(500).json({ error: 'Erreur lors de la vérification' })
  }
})

/**
 * Webhook NotchPay
 */
router.post(
  '/webhook/notchpay',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const signatureHeader = req.headers['x-notch-signature'] || ''
      const payloadRaw = req.body ? req.body.toString('utf8') : ''
      const secret = process.env.NOTCHPAY_WEBHOOK_HASH || ''

      // Vérification signature
      const signature = signatureHeader.startsWith('sha256=')
        ? signatureHeader.split('=')[1]
        : signatureHeader

      const hmac = crypto.createHmac('sha256', secret)
      hmac.update(payloadRaw)
      const expected = hmac.digest('hex')

      if (!safeHexCompare(expected, signature)) {
        console.error('❌ Invalid webhook signature')
        return res.status(403).send('Invalid signature')
      }

      const event = JSON.parse(payloadRaw)
      console.log('📩 Webhook reçu:', JSON.stringify(event, null, 2))

      const notchRef = event?.data?.reference
      const merchantRef = event?.data?.merchant_reference
      const targetRef = notchRef || merchantRef

      if (!targetRef) {
        console.log('Webhook sans référence, ignoré')
        return res.status(200).send('No reference')
      }

      // Gestion des événements
      if (
        event.type === 'payment.complete' ||
        event.event === 'payment.completed'
      ) {
        await prisma.transaction.updateMany({
          where: { reference: targetRef },
          data: { status: 'complete', notchData: event },
        })

        const tx = await prisma.transaction.findFirst({
          where: { reference: targetRef },
        })
        if (tx?.orderId) {
          await prisma.order.update({
            where: { id: tx.orderId },
            data: { status: 'paid' },
          })
        }
        console.log('✅ Transaction completed:', targetRef)
      } else if (
        event.type === 'payment.failed' ||
        event.event === 'payment.failed'
      ) {
        await prisma.transaction.updateMany({
          where: { reference: targetRef },
          data: { status: 'failed', notchData: event },
        })

        const tx = await prisma.transaction.findFirst({
          where: { reference: targetRef },
        })
        if (tx?.orderId) {
          await prisma.order.update({
            where: { id: tx.orderId },
            data: { status: 'failed' },
          })
        }
        console.log('❌ Transaction failed:', targetRef)
      } else if (
        event.type === 'payment.created' ||
        event.event === 'payment.created'
      ) {
        console.log('📝 Payment created:', targetRef)
        // Optionnel: mise à jour du statut en "initiated"
      } else {
        console.log('⚠️ Webhook event non géré:', event.type || event.event)
      }

      return res.status(200).send('OK')
    } catch (err) {
      console.error('Webhook processing error:', err)
      return res.status(500).send('Server error')
    }
  }
)

/**
 * Callback pour retour de redirection
 */
router.get('/callback', async (req, res) => {
  try {
    const { reference } = req.query
    if (!reference) {
      return res.status(400).send('Missing reference')
    }

    const callbackResponse = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: { Authorization: `${process.env.NOTCH_PUBLIC_KEY}` },
      }
    )
    const data = await callbackResponse.json()
    console.log('Callback verify:', JSON.stringify(data, null, 2))

    const txRef = data.transaction?.reference || reference
    const status = data.transaction?.status

    if (status === 'complete') {
      await prisma.transaction.updateMany({
        where: { reference: txRef },
        data: { status: 'complete', notchData: data },
      })

      const tx = await prisma.transaction.findFirst({
        where: { reference: txRef },
      })
      if (tx?.orderId) {
        await prisma.order.update({
          where: { id: tx.orderId },
          data: { status: 'paid' },
        })
      }

      return res.redirect(
        `https://pleingaz-site-web.vercel.app/order-confirmation?ref=${txRef}`
      )
    } else {
      return res.redirect(
        'https://pleingaz-site-web.vercel.app/cart?payment=failed'
      )
    }
  } catch (err) {
    console.error('Callback error:', err)
    return res.redirect(
      'https://pleingaz-site-web.vercel.app/cart?payment=error'
    )
  }
})

export default router
