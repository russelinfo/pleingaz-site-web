// routes/paymentRoutes.js
import express from 'express'
import fetch from 'node-fetch'
import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()
const router = express.Router()

/**
 * Vérification de la signature NotchPay
 */
function verifySignature(payload, signature, secret) {
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

/**
 * Initialiser un paiement
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

    const response = await fetch('https://api.notchpay.co/payments', {
      method: 'POST',
      headers: {
        Authorization: process.env.NOTCH_PUBLIC_KEY, // ⚠️ Clé publique
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        customer: { name, email, phone },
        description: description || 'Paiement PleinGaz',
        callback:
          'https://pleingaz-site-web.onrender.com/api/payments/callback',
        reference: 'pleingaz-' + Date.now(),
      }),
    })

    const data = await response.json()
    console.log('✅ NotchPay response:', data)

    return res.json(data)
  } catch (err) {
    console.error('❌ Payment initialize error:', err)
    return res
      .status(500)
      .json({ error: "Erreur lors de l'initialisation du paiement" })
  }
})

/**
 * Vérifier un paiement
 */
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params

    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: {
          Authorization: process.env.NOTCH_PUBLIC_KEY,
        },
      }
    )

    const data = await response.json()
    console.log('✅ Payment verification:', data)

    return res.json(data)
  } catch (err) {
    console.error('❌ Payment verify error:', err)
    return res
      .status(500)
      .json({ error: 'Erreur lors de la vérification du paiement' })
  }
})

/**
 * Webhook (⚠️ Express RAW obligatoire pour valider la signature)
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    try {
      const signature = req.headers['x-notch-signature']
      const secret = process.env.NOTCHPAY_WEBHOOK_HASH
      const payload = req.body.toString('utf8')

      if (!verifySignature(payload, signature, secret)) {
        console.error('❌ Invalid webhook signature')
        return res.status(403).send('Invalid signature')
      }

      const event = JSON.parse(payload)
      console.log('📩 Webhook validé:', event)

      // Traitement selon le type d’événement
      switch (event.type) {
        case 'payment.complete':
          console.log('✅ Paiement complété :', event.data)
          break
        case 'payment.failed':
          console.log('❌ Paiement échoué :', event.data)
          break
        default:
          console.log('ℹ️ Autre événement reçu :', event.type)
      }

      res.status(200).send('Webhook reçu et validé')
    } catch (error) {
      console.error('Erreur Webhook:', error)
      res.status(500).send('Erreur serveur')
    }
  }
)

/**
 * Callback après paiement
 */
router.get('/callback', async (req, res) => {
  const reference = req.query.reference

  try {
    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: {
          Authorization: `${process.env.NOTCH_PUBLIC_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()
    console.log('🔎 NotchPay verify response:', JSON.stringify(data, null, 2))

    if (data.transaction && data.transaction.status === 'complete') {
      res.send('✅ Payment successful!')
    } else {
      res.send('⚠️ Payment not completed.')
    }
  } catch (error) {
    console.error('❌ Error verifying payment:', error)
    res.status(500).send('Error verifying payment')
  }
})

export default router
