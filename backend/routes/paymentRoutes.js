// routes/paymentRoutes.js
import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import crypto from 'crypto'

const router = express.Router()

// Initialiser un paiement
dotenv.config()
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
        Authorization: process.env.NOTCH_PUBLIC_KEY, // ⚠️ utilise la clé PUBLIQUE
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        customer: { name, email, phone },
        description: description || 'Paiement PleinGaz',
        callback: 'https://pleingaz-site-web.onrender.com/api/payments/callback',
        
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

// Vérifier un paiement
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params

    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: {
          Authorization: process.env.NOTCH_PUBLIC_KEY, // toujours clé PUBLIQUE
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
 * Vérification de la signature NotchPay
 */
function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac("sha256", secret);
  const calculatedSignature = hmac.update(payload).digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(calculatedSignature, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Webhook NotchPay
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }), // raw JSON ici
  (req, res) => {
    const signature = req.headers['x-notch-signature']
    const payload = req.body.toString() // ✅ raw string
    const secret = process.env.NOTCHPAY_WEBHOOK_HASH

    if (!verifySignature(payload, signature, secret)) {
      console.error('❌ Invalid webhook signature')
      return res.status(403).send('Invalid signature')
    }

    const event = JSON.parse(payload)
    console.log('📩 Webhook validé:', event)

    res.status(200).send('Webhook reçu et validé')
  }
);

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

    // 🔎 Affiche dans ta console ce que NotchPay renvoie
    console.log('🔎 NotchPay verify response:', JSON.stringify(data, null, 2))

    if (data.transaction && data.transaction.status === 'complete') {
      res.send('✅ Payment successful!')
    } else {
      res.send('⚠️ Payment not completed.')
      console.log(
        'Valeur de la clé privée chargée :',
        process.env.NOTCH_PUBLIC_KEY
      )
    }
  } catch (error) {
    console.error('❌ Error verifying payment:', error)
    res.status(500).send('Error verifying payment')
  }
})

export default router
