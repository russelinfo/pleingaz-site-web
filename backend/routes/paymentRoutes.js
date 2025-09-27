// routes/paymentRoutes.js
import express from 'express'
import fetch from 'node-fetch'
import crypto from 'crypto'
import dotenv from 'dotenv'
import prisma from '../prismaClient.js'

dotenv.config()
const router = express.Router()

// Vérif signature webhook
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

// Normalisation du numéro
function formatPhone(phone) {
  let f = (phone || '').replace(/[^0-9+]/g, '')
  if (f.startsWith('0')) f = f.substring(1)
  if (!f.startsWith('+237')) {
    if (f.startsWith('237')) f = '+' + f
    else f = '+237' + f
  }
  return f
}

// ------------------------------------------------------------------
// Init paiement
// ------------------------------------------------------------------
router.post('/initialize', async (req, res) => {
  try {
    let { amount, email, phone, orderId, paymentMethod } = req.body
    if (!amount || !email || !phone || !orderId || !paymentMethod) {
      return res.status(400).json({ error: 'Champs requis manquants' })
    }

    phone = formatPhone(phone)
    const merchantReference = crypto.randomUUID()

    // Enregistrer transaction (UUID = merchantReference)
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        customerEmail: email,
        customerPhone: phone,
        orderId,
        status: 'pending',
        merchantReference,
      },
    })

    // Appel API NotchPay
    const response = await fetch('https://api.notchpay.co/payments', {
      method: 'POST',
      headers: {
        Authorization: `${process.env.NOTCH_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'XAF',
        reference: merchantReference, // référence interne
        phone,
        email,
        payment_method: paymentMethod,
        description: `Commande PleinGaz #${orderId}`,
        callback:
          'https://pleingaz-site-web.onrender.com/api/payments/callback',
      }),
    })
    const data = await response.json()
    console.log('✅ Init NotchPay:', data)

    if (response.status === 201 && data.transaction?.reference) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          reference: data.transaction.reference,
          notchData: data.transaction,
        },
      })
      return res.json({
        success: true,
        reference: data.transaction.reference,
        authorization_url: data.authorization_url || null,
        status: data.transaction.status,
      })
    }

    return res.status(500).json({ success: false, message: data.message })
  } catch (err) {
    console.error('❌ Init error:', err)
    res.status(500).json({ error: 'Erreur init paiement' })
  }
})

// ------------------------------------------------------------------
// Vérification manuelle
// ------------------------------------------------------------------
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
    console.log('🔎 Verify:', data)

    if (data.transaction?.status === 'complete') {
      await prisma.transaction.updateMany({
        where: { reference },
        data: { status: 'complete', notchData: data },
      })
      const tx = await prisma.transaction.findFirst({ where: { reference } })
      if (tx?.orderId) {
        await prisma.order.update({
          where: { id: tx.orderId },
          data: { status: 'paid' },
        })
      }
    }

    return res.json({
      status: data.transaction?.status || 'pending',
      message: data.message,
    })
  } catch (err) {
    console.error('❌ Verify error:', err)
    res.status(500).json({ error: 'Erreur vérification' })
  }
})

// ------------------------------------------------------------------
// Webhook
// ------------------------------------------------------------------
router.post(
  '/webhook/notchpay',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const sigHeader = req.headers['x-notch-signature'] || ''
      const payload = req.body?.toString('utf8') || ''
      const secret = process.env.NOTCHPAY_WEBHOOK_HASH || ''
      const hmac = crypto.createHmac('sha256', secret)
      hmac.update(payload)
      const expected = hmac.digest('hex')
      const signature = sigHeader.split('=')[1] || sigHeader

      if (!safeHexCompare(expected, signature)) {
        console.error('❌ Invalid webhook signature')
        return res.status(403).send('Invalid signature')
      }

      const event = JSON.parse(payload)
      console.log('📩 Webhook:', event.type, event.data)

      const notchRef = event?.data?.reference
      if (!notchRef) return res.status(200).send('No reference')

      if (event.type === 'payment.complete') {
        await prisma.transaction.updateMany({
          where: { reference: notchRef },
          data: { status: 'complete', notchData: event },
        })
      } else if (event.type === 'payment.failed') {
        await prisma.transaction.updateMany({
          where: { reference: notchRef },
          data: { status: 'failed', notchData: event },
        })
      }

      return res.status(200).send('OK')
    } catch (err) {
      console.error('❌ Webhook error:', err)
      return res.status(500).send('Erreur serveur')
    }
  }
)

// ------------------------------------------------------------------
// Callback
// ------------------------------------------------------------------
router.get('/callback', async (req, res) => {
  const reference = req.query.reference
  try {
    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: { Authorization: `${process.env.NOTCH_PUBLIC_KEY}` },
      }
    )
    const data = await response.json()
    console.log('🔎 Callback verify:', data)

    if (data.transaction?.status === 'complete') {
      return res.redirect(
        `https://pleingaz-site-web.vercel.app/order-confirmation?ref=${reference}`
      )
    }
    return res.redirect(`https://pleingaz-site-web.vercel.app/cart`)
  } catch (err) {
    console.error('❌ Callback error:', err)
    return res.redirect(`https://pleingaz-site-web.vercel.app/cart`)
  }
})

export default router
