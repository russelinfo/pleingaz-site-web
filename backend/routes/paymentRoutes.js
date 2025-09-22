// routes/paymentRoutes.js
import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import crypto from 'crypto'

const router = express.Router()
dotenv.config()

// Initialiser un paiement
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
        Authorization: process.env.NOTCH_PUBLIC_KEY, // ✅ Clé PRIVÉE pour API
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

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ NotchPay API Error:', response.status, errorText)
      return res.status(response.status).json({ error: 'Erreur API NotchPay' })
    }

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

// Vérifier un paiement
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params

    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: {
          Authorization: process.env.NOTCH_PUBLIC_KEY, // ✅ Clé PRIVÉE pour API
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ NotchPay Verify Error:', response.status, errorText)
      return res
        .status(response.status)
        .json({ error: 'Erreur vérification NotchPay' })
    }

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
 * Vérification de la signature NotchPay
 */
function verifySignature(payload, signature, secret) {
  if (!payload || !signature || !secret) {
    console.error('❌ Missing webhook verification data')
    return false
  }

  try {
    const hmac = crypto.createHmac('sha256', secret)
    const calculatedSignature = hmac.update(payload, 'utf8').digest('hex')

    console.log('🔍 Webhook verification:')
    console.log('- Received signature:', signature)
    console.log('- Calculated signature:', calculatedSignature)
    console.log('- Secret used:', secret.substring(0, 10) + '...')

    return crypto.timingSafeEqual(
      Buffer.from(calculatedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    )
  } catch (error) {
    console.error('❌ Signature verification error:', error)
    return false
  }
}

/**
 * ✅ Webhook NotchPay - PAS de middleware ici car déjà appliqué dans server.js
 */
router.post('/webhook', (req, res) => {
  console.log('📨 Webhook reçu')
  console.log('- Headers:', req.headers)
  console.log('- Body type:', typeof req.body)
  console.log('- Body length:', req.body ? req.body.length : 0)

  try {
    const signature = req.headers['x-notch-signature']
    const payload = req.body.toString('utf8') // ✅ Buffer vers string
    const secret = process.env.NOTCHPAY_WEBHOOK_HASH

    if (!signature) {
      console.error('❌ Pas de signature dans les headers')
      return res.status(400).send('Missing signature')
    }

    if (!verifySignature(payload, signature, secret)) {
      console.error('❌ Signature webhook invalide')
      return res.status(403).send('Invalid signature')
    }

    const event = JSON.parse(payload)
    console.log('✅ Webhook validé:', event)

    // Traiter l'événement selon son type
    if (event.event && event.data) {
      console.log(`📩 Événement: ${event.event}`)
      console.log(`📊 Données:`, event.data)

      // Ajouter ici votre logique métier
      // Par exemple: mettre à jour BDD, envoyer email, etc.
    }

    res.status(200).send('Webhook processed successfully')
  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    res.status(500).send('Webhook processing failed')
  }
})

// Callback pour redirection après paiement (optionnel)
router.get('/callback', async (req, res) => {
  const reference = req.query.reference

  try {
    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: {
          Authorization: process.env.NOTCH_PUBLIC_KEY, // ✅ Clé PRIVÉE
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

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
