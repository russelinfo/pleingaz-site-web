// routes/paymentRoutes.js
import express from 'express'
import fetch from 'node-fetch'
import crypto from 'crypto'
import dotenv from 'dotenv'
import prisma from '../prismaClient.js' // ton prismaClient

dotenv.config()
const router = express.Router()

/** Helper: normalize phone for Cameroon (+237...) */
function normalizeCameroonPhone(phone) {
  if (!phone) return phone
  let p = phone.toString().trim()
  // remove spaces, dashes
  p = p.replace(/[\s\-()]/g, '')
  // si commence par 0 (ex: 06xxxx), remplace par +2376xxxx
  if (/^0[0-9]+$/.test(p)) {
    return '+237' + p.slice(1)
  }
  // si commence par '237' sans '+'
  if (/^237[0-9]+$/.test(p)) {
    return '+' + p
  }
  // si commence par 6xxxx (local), préfixe
  if (/^[6-9][0-9]{7,}$/.test(p)) {
    return '+237' + p
  }
  // si déjà bien formé ou autre, retourne tel quel
  return p
}

/** Verify signature HMAC SHA256 (hex) */
function verifySignature(payload, signature, secret) {
  if (!signature || !secret) return false
  try {
    const hmac = crypto.createHmac('sha256', secret)
    const expected = hmac.update(payload).digest('hex')

    const sigBuf = Buffer.from(signature, 'hex')
    const expBuf = Buffer.from(expected, 'hex')
    if (sigBuf.length !== expBuf.length) return false
    return crypto.timingSafeEqual(sigBuf, expBuf)
  } catch (e) {
    // parsing hex could fail
    return false
  }
}

/** POST /api/payments/initialize
 * Body: { amount, email, phone, orderId, name?, description? }
 */
router.post('/initialize', async (req, res) => {
  try {
    const { amount, email, phone, orderId, name, description } = req.body
    if (!amount || !email || !phone || !orderId) {
      return res
        .status(400)
        .json({ error: 'amount, email, phone et orderId sont requis' })
    }

    const normalizedPhone = normalizeCameroonPhone(phone)

    // merchant reference (ta référence interne)
    const merchantReference = 'pleingaz-' + Date.now()

    // 1) créer la transaction en DB
    const transaction = await prisma.transaction.create({
      data: {
        reference: merchantReference,
        amount,
        currency: 'XAF',
        customerName: name || null,
        customerEmail: email,
        customerPhone: normalizedPhone,
        status: 'pending',
        orderId: orderId,
      },
    })

    // 2) Appel NotchPay -> initialisation du paiement
    // Utilise la clé API que tu as configurée dans .env (NOTCH_PUBLIC_KEY ou NOTCH_API_KEY)
    const response = await fetch('https://api.notchpay.co/payments', {
      method: 'POST',
      headers: {
        Authorization:
          process.env.NOTCH_PUBLIC_KEY || process.env.NOTCH_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'XAF',
        customer: { name: name || 'Client', email, phone: normalizedPhone },
        description: description || 'Paiement PleinGaz',
        callback:
          process.env.PAYMENT_CALLBACK_URL ||
          'https://pleingaz-site-web.onrender.com/api/payments/callback',
        reference: merchantReference, // envoie ta reference interne en merchant_reference
      }),
    })

    const data = await response.json()
    console.log('✅ NotchPay init response:', JSON.stringify(data, null, 2))

    // si NotchPay a renvoyé une transaction avec une référence trx.xxxx -> l'enregistrer
    const notchRef = data?.transaction?.reference || null

    if (notchRef) {
      await prisma.transaction.update({
        where: { reference: merchantReference },
        data: { notchReference: notchRef, notchData: data },
      })
    } else {
      // stocker quand même la réponse pour debug
      await prisma.transaction.update({
        where: { reference: merchantReference },
        data: { notchData: data },
      })
    }

    if (data && (data.authorization_url || data.authorizationUrl)) {
      return res.json({
        success: true,
        authorization_url: data.authorization_url || data.authorizationUrl,
        reference: merchantReference,
      })
    }

    // Si NotchPay renvoie une erreur
    if (data?.status === 'Unauthorized' || data?.code === 401) {
      console.error('NotchPay init unauthorized. Vérifie ta clé API.')
      return res
        .status(401)
        .json({ success: false, message: 'Invalid NotchPay credentials' })
    }

    // fallback
    return res
      .status(200)
      .json({ success: true, data, reference: merchantReference })
  } catch (err) {
    console.error('❌ Payment initialize error:', err)
    return res
      .status(500)
      .json({ error: "Erreur lors de l'initialisation du paiement" })
  }
})

/** GET /api/payments/verify/:reference
 * On fournit la reference merchant (celle stockée dans ta table transaction.reference)
 */
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params
    const tx = await prisma.transaction.findUnique({ where: { reference } })
    if (!tx) return res.status(404).json({ error: 'Transaction introuvable' })

    // On privilégie la notchReference (trx.xxxx) pour appeler l'API NotchPay
    const remoteRef = tx.notchReference || tx.reference

    const response = await fetch(
      `https://api.notchpay.co/payments/${remoteRef}`,
      {
        headers: {
          Authorization:
            process.env.NOTCH_PUBLIC_KEY || process.env.NOTCH_API_KEY,
        },
      }
    )
    const data = await response.json()
    console.log('✅ Payment verification:', data)

    // mise à jour DB selon le statut renvoyé
    const status = data?.transaction?.status || null
    if (status === 'complete') {
      await prisma.transaction.update({
        where: { reference: reference },
        data: {
          status: 'complete',
          notchData: data,
          notchReference: data.transaction.reference || tx.notchReference,
        },
      })
    } else if (status === 'failed') {
      await prisma.transaction.update({
        where: { reference: reference },
        data: { status: 'failed', notchData: data },
      })
    } else {
      // mettre à jour notchData quand même
      await prisma.transaction.updateMany({
        where: { reference },
        data: { notchData: data },
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
 * Webhook NotchPay
 * Route: POST /api/payments/webhook/notchpay
 * IMPORTANT: express.raw must be used for this route (see server.js)
 */
router.post(
  '/webhook/notchpay',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const payload = req.body ? req.body.toString('utf8') : ''
      const signature = (
        req.headers['x-notch-signature'] || req.headers['X-Notch-Signature']
      )?.toString()
      const secret = process.env.NOTCHPAY_WEBHOOK_HASH

      // Test/ping depuis dashboard NotchPay : parfois pas de signature
      if (!signature) {
        console.log(
          '🔎 Webhook test/validation reçu (pas de signature) — payload:',
          payload
        )
        return res.status(200).send('Webhook endpoint verified')
      }

      // Debug utile (n'affiche PAS le secret en prod)
      console.log(
        'Webhook signature header:',
        signature,
        'secret present?',
        !!secret
      )

      if (!verifySignature(payload, signature, secret)) {
        console.error('❌ Invalid webhook signature')
        // NotchPay attend un 2xx pour considérer endpoint valide, mais renvoyons 403 pour debug
        return res.status(403).send('Invalid signature')
      }

      const event = JSON.parse(payload)
      console.log('📩 Webhook validé:', JSON.stringify(event, null, 2))

      // récupérer merchant_reference + notch reference
      const merchantRef =
        event?.data?.merchant_reference ||
        event?.data?.trxref ||
        event?.data?.merchantReference
      const notchRef = event?.data?.reference || event?.data?.trx_reference

      if (!merchantRef && !notchRef) {
        console.warn(
          'Webhook sans référence — impossible de lier la transaction'
        )
        return res.status(200).send('No reference')
      }

      // Mise à jour : on tente de mettre à jour par merchantRef d'abord, sinon par notchRef
      if (merchantRef) {
        await prisma.transaction.updateMany({
          where: { reference: merchantRef },
          data: {
            status:
              event?.type === 'payment.complete'
                ? 'complete'
                : event?.type === 'payment.failed'
                ? 'failed'
                : 'pending',
            notchReference: notchRef || undefined,
            notchData: event,
          },
        })
        console.log('✅ Transaction mise à jour par merchantRef:', merchantRef)
      } else if (notchRef) {
        await prisma.transaction.updateMany({
          where: { notchReference: notchRef },
          data: {
            status:
              event?.type === 'payment.complete'
                ? 'complete'
                : event?.type === 'payment.failed'
                ? 'failed'
                : 'pending',
            notchData: event,
          },
        })
        console.log('✅ Transaction mise à jour par notchRef:', notchRef)
      }

      return res.status(200).send('Webhook reçu et validé')
    } catch (error) {
      console.error('Erreur Webhook:', error)
      return res.status(500).send('Erreur serveur')
    }
  }
)

/** Callback (user revient après paiement) */
router.get('/callback', async (req, res) => {
  const reference = req.query.reference
  try {
    // on vérifie la transaction via NotchPay (on essaye notchReference puis merchant)
    const tx = await prisma.transaction.findUnique({ where: { reference } })
    const remoteRef = tx?.notchReference || reference

    const response = await fetch(
      `https://api.notchpay.co/payments/${remoteRef}`,
      {
        headers: {
          Authorization:
            process.env.NOTCH_PUBLIC_KEY || process.env.NOTCH_API_KEY,
        },
      }
    )
    const data = await response.json()
    console.log('🔎 NotchPay verify response:', JSON.stringify(data, null, 2))

    if (data.transaction?.status === 'complete') {
      const txRef = tx?.reference || reference
      await prisma.transaction.update({
        where: { reference: txRef },
        data: {
          status: 'complete',
          notchData: data,
          notchReference: data.transaction.reference || tx?.notchReference,
        },
      })
      if (tx?.orderId) {
        await prisma.order.update({
          where: { id: tx.orderId },
          data: { status: 'paid' },
        })
      }
      return res.redirect(
        process.env.FRONTEND_SUCCESS_URL ||
          `https://pleingaz-site-web.vercel.app/order-confirmation?ref=${txRef}`
      )
    } else {
      return res.redirect(
        process.env.FRONTEND_FAIL_URL ||
          `https://pleingaz-site-web.vercel.app/cart`
      )
    }
  } catch (error) {
    console.error('❌ Error verifying payment on callback:', error)
    return res.redirect(
      process.env.FRONTEND_FAIL_URL ||
        `https://pleingaz-site-web.vercel.app/cart`
    )
  }
})

export default router
