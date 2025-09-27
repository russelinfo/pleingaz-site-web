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
  // remove leading 0 (e.g. 0677 -> 677)
  if (s.startsWith('0')) s = s.slice(1)
  // if starts with 237 (without +) add +
  if (s.startsWith('237') && !s.startsWith('+')) s = `+${s}`
  // if doesn't start with +237, add prefix
  if (!s.startsWith('+237')) {
    // if it starts with + and not +237, keep it (for card flows etc)
    if (s.startsWith('+')) {
      // keep as is
    } else {
      s = `+237${s}`
    }
  }
  // avoid double-plus
  s = s.replace(/^\+\+/, '+')
  return s
}

/**
 * POST /api/payments/initialize
 * Body: {
 *   customerName, customerEmail, customerPhone,
 *   deliveryAddress, paymentMethod, items: [{productId, quantity, unitPrice}], totalAmount
 * }
 *
 * This endpoint:
 *  - creates an Order
 *  - creates a Transaction (internal merchant_reference UUID)
 *  - calls NotchPay initialize with merchant_reference set to that UUID
 *  - updates transaction with returned notch reference (trx...) so verify/webhook can find it
 *  - returns either { authorization_url, reference, status } OR { reference, status } for USSD flows
 */
router.post('/initialize', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      paymentMethod, // e.g. 'cash' | 'momo.mtn' | 'momo.orange' | 'card'
      items,
      totalAmount,
    } = req.body

    if (!customerName || !customerEmail || !customerPhone || !deliveryAddress) {
      return res.status(400).json({ error: 'Infos client manquantes' })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Aucun article fourni' })
    }

    // 1) create order + items
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

    // If payment method is cash on delivery -> we just return order and keep status pending.
    if (!paymentMethod || paymentMethod === 'cash') {
      return res.json({
        success: true,
        orderId: order.id,
        payment: { method: 'cash', status: 'pending' },
      })
    }

    // 2) create transaction with internal merchant_reference
    const merchantReference = crypto.randomUUID()

    let transaction = await prisma.transaction.create({
      data: {
        reference: merchantReference, // initially store merchant UUID
        status: 'pending',
        amount: totalAmount || order.totalAmount,
        customerName,
        customerEmail,
        customerPhone: formatPhoneCameroon(customerPhone),
        orderId: order.id,
      },
    })

    // 3) call NotchPay initialize
    const notchUrl = 'https://api.notchpay.co/payments' // endpoint used previously
    const body = {
      amount: transaction.amount,
      currency: 'XAF',
      reference: merchantReference, // merchant reference = our UUID
      phone: transaction.customerPhone,
      email: transaction.customerEmail,
      description: `Commande PleinGaz #${order.id}`,
      callback: 'https://pleingaz-site-web.onrender.com/api/payments/callback',
      // If notch requires a "payment_method" key style, pass paymentMethod
      payment_method: paymentMethod,
    }

    const notchResp = await fetch(notchUrl, {
      method: 'POST',
      headers: {
        Authorization: `${process.env.NOTCH_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const notchData = await notchResp.json()
    console.log(
      'NotchPay initialize response:',
      JSON.stringify(notchData, null, 2)
    )

    // If Notch returns a transaction reference (trx.*), update our transaction reference to that (so later polling uses it)
    const nothTxRef = notchData?.transaction?.reference || notchData?.reference

    if (nothTxRef) {
      // Update DB: store notchData and replace reference with Notch reference for polling
      transaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          reference: nothTxRef,
          notchData: notchData,
        },
      })
    } else {
      // store notchData anyway
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { notchData: notchData },
      })
    }

    // Return to client:
    // - if Notch provides authorization_url (card flow) -> clients must be redirected to it.
    // - if Notch returns only trx and status pending (USSD push) -> client will poll verify endpoint.
    return res.json({
      success: true,
      orderId: order.id,
      reference: transaction.reference, // now either merchant ref or notch trx
      authorization_url: notchData.authorization_url || null,
      notchResponse: notchData,
    })
  } catch (err) {
    console.error('Payment initialize error:', err)
    return res.status(500).json({ error: 'Erreur lors de l initialisation' })
  }
})

/**
 * GET /api/payments/verify/:reference
 * Query NotchPay by reference (trx.*) and update our DB if complete/failed
 */
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params
    if (!reference)
      return res.status(400).json({ error: 'reference manquante' })

    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: { Authorization: `${process.env.NOTCH_PUBLIC_KEY}` },
      }
    )
    const data = await response.json()
    console.log('Payment verification:', JSON.stringify(data, null, 2))

    const txRef = data.transaction?.reference || reference
    if (data.transaction?.status === 'complete') {
      await prisma.transaction.updateMany({
        where: { reference: txRef },
        data: { status: 'complete', notchData: data },
      })
      // update order status too
      const tx = await prisma.transaction.findFirst({
        where: { reference: txRef },
      })
      if (tx?.orderId) {
        await prisma.order.update({
          where: { id: tx.orderId },
          data: { status: 'paid' },
        })
      }
    } else if (data.transaction?.status === 'failed') {
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
      status: data.transaction?.status || 'unknown',
      message: data.message || null,
      data,
    })
  } catch (err) {
    console.error('Payment verify error:', err)
    return res.status(500).json({ error: 'Erreur lors de la verification' })
  }
})

/**
 * Webhook: POST /api/payments/webhook/notchpay
 * NotchPay sends raw JSON and an HMAC SHA256 header x-notch-signature
 */
router.post(
  '/webhook/notchpay',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const signatureHeader = req.headers['x-notch-signature'] || ''
      const payloadRaw = req.body ? req.body.toString('utf8') : ''
      const secret = process.env.NOTCHPAY_WEBHOOK_HASH || ''

      // Notch sometimes sends signature prefixed like "sha256=..."
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

      // Update transaction by notch reference OR merchant_reference if we kept merchant in a separate field
      const targetRef = notchRef || merchantRef
      if (!targetRef) {
        console.log('Webhook sans référence, on ignore')
        return res.status(200).send('No reference')
      }

      if (
        event.type === 'payment.complete' ||
        event.event === 'payment.completed'
      ) {
        await prisma.transaction.updateMany({
          where: { reference: targetRef },
          data: { status: 'complete', notchData: event },
        })
        // update order status
        const tx = await prisma.transaction.findFirst({
          where: { reference: targetRef },
        })
        if (tx?.orderId) {
          await prisma.order.update({
            where: { id: tx.orderId },
            data: { status: 'paid' },
          })
        }
        console.log('✅ Transaction marked complete', targetRef)
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
        console.log('❌ Transaction marked failed', targetRef)
      } else {
        console.log('Webhook event non géré:', event.type || event.event)
      }

      return res.status(200).send('OK')
    } catch (err) {
      console.error('Webhook processing error:', err)
      return res.status(500).send('Server error')
    }
  }
)

/**
 * Callback route used when user returns from redirect payment (card)
 * GET /api/payments/callback?reference=...
 */
router.get('/callback', async (req, res) => {
  try {
    const { reference } = req.query
    if (!reference) return res.status(400).send('Missing reference')
    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: { Authorization: `${process.env.NOTCH_PUBLIC_KEY}` },
      }
    )
    const data = await response.json()
    console.log('Callback verify:', JSON.stringify(data, null, 2))

    if (data.transaction?.status === 'complete') {
      const txRef = data.transaction.reference || reference
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
      // Not completed
      return res.redirect('https://pleingaz-site-web.vercel.app/cart')
    }
  } catch (err) {
    console.error('Callback error:', err)
    return res.redirect('https://pleingaz-site-web.vercel.app/cart')
  }
})

export default router
