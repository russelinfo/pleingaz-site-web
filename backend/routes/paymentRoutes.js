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
        // callback: 'http://localhost:5000/api/payments/callback',
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
 * ✅ Vérification signature selon documentation officielle NotchPay
 */
function verifyWebhookSignature(payload, signature, hash) {
  try {
    const hmac = crypto.createHmac('sha256', hash)
    const expectedSignature = hmac.update(payload).digest('hex')

    console.log('🔍 Webhook verification (Documentation officielle):')
    console.log('- Payload length:', payload.length)
    console.log('- Received signature:', signature)
    console.log('- Expected signature:', expectedSignature)
    console.log('- Hash used:', hash.substring(0, 15) + '...')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    console.error('❌ Signature verification error:', error)
    return false
  }
}

/**
 * ✅ Webhook NotchPay - EXACTEMENT selon la documentation
 */
router.post('/webhook', (req, res) => {
  console.log('📨 Webhook NotchPay reçu')
  console.log('- Headers:', JSON.stringify(req.headers, null, 2))
  console.log('- Body:', JSON.stringify(req.body, null, 2))
  console.log('- Raw Body available:', !!req.rawBody)

  try {
    // ✅ Utilise JSON.stringify(req.body) comme dans la doc officielle
    const payload = req.rawBody || JSON.stringify(req.body)
    const signature = req.headers['x-notch-signature']
    const hash = process.env.NOTCHPAY_WEBHOOK_HASH
    const userAgent = req.headers['user-agent']

    console.log('📋 Webhook data:')
    console.log('- Payload:', payload)
    console.log('- Signature:', signature)
    console.log('- User-Agent:', userAgent)

    // ✅ Gérer les tests de vérification NotchPay (sans signature)
    if (userAgent === 'Notch-Webhook-Verification/1.0' && !signature) {
      console.log('🧪 Test de vérification NotchPay - Endpoint validé')
      return res.status(200).send('Webhook endpoint verified')
    }

    // ✅ Vérifier la signature pour les vrais webhooks
    if (!signature) {
      console.error('❌ Missing x-notch-signature header')
      return res.status(403).send('Missing signature')
    }

    if (!hash) {
      console.error('❌ NOTCHPAY_WEBHOOK_HASH not configured')
      return res.status(500).send('Webhook hash not configured')
    }

    // ✅ Vérification signature selon doc officielle
    if (!verifyWebhookSignature(payload, signature, hash)) {
      console.error('❌ Invalid webhook signature')
      return res.status(403).send('Invalid signature')
    }

    // ✅ Traitement du webhook validé
    const event = req.body // Déjà parsé par express.json()
    console.log('✅ Webhook signature validée!')
    console.log('📨 Événement reçu:', JSON.stringify(event, null, 2))

    // ✅ Traiter selon le type d'événement
    if (event.event && event.data) {
      console.log(`📩 Type d'événement: ${event.event}`)
      console.log(`📊 Données:`, event.data)

      switch (event.event) {
        case 'payment.complete':
          console.log('💰 Paiement complété:', event.data.reference)
          // Ici: mettre à jour votre BDD, envoyer confirmation, etc.
          break

        case 'payment.failed':
          console.log('❌ Paiement échoué:', event.data.reference)
          // Ici: traiter l'échec du paiement
          break

        case 'payment.pending':
          console.log('⏳ Paiement en attente:', event.data.reference)
          break

        default:
          console.log(`📋 Événement non traité: ${event.event}`)
      }
    }

    // ✅ Réponse de succès
    res.status(200).send('Webhook processed successfully')
  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    res.status(500).send('Webhook processing failed')
  }
})

// Callback pour redirection après paiement (optionnel)
router.get('/callback', async (req, res) => {
  const reference = req.query.reference

  if (!reference) {
    return res.status(400).send('Missing reference parameter')
  }

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
      res.send(`
        <h1>✅ Paiement réussi!</h1>
        <p>Référence: ${reference}</p>
        <p>Merci pour votre achat.</p>
      `)
    } else {
      res.send(`
        <h1>⚠️ Paiement en cours</h1>
        <p>Référence: ${reference}</p>
        <p>Status: ${data.transaction?.status || 'unknown'}</p>
      `)
    }
  } catch (error) {
    console.error('❌ Error verifying payment:', error)
    res.status(500).send(`
      <h1>❌ Erreur de vérification</h1>
      <p>Une erreur s'est produite lors de la vérification du paiement.</p>
    `)
  }
})

export default router
