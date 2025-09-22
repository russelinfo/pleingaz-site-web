// routes/paymentRoutes.js
import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

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

// Webhook NotchPay
router.post('/webhook', express.json(), (req, res) => {
  try {
    const event = req.body || {};

    // 👇 Cas où NotchPay teste juste l'endpoint sans data
    if (!event.type) {
      console.log("🔎 Webhook test reçu:", event);
      return res.status(200).send("Webhook OK");
    }

    console.log("📩 Webhook reçu:", event);

    switch (event.type) {
      case "payment.complete":
        console.log("✅ Paiement complété :", event.data);
        break;
      case "payment.failed":
        console.log("❌ Paiement échoué :", event.data);
        break;
      default:
        console.log("ℹ️ Autre événement :", event.type);
    }

    res.status(200).send("Webhook reçu");
  } catch (error) {
    console.error("Erreur Webhook:", error);
    res.status(200).send("Erreur mais endpoint joignable"); // 👈 Toujours renvoyer 200
  }
});


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
