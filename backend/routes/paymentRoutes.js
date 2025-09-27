// routes/paymentRoutes.js
import express from 'express'
import fetch from 'node-fetch'
import crypto from 'crypto'
import dotenv from 'dotenv'
import prisma from '../prismaClient.js'

dotenv.config()
const router = express.Router()

/**
 * Helper: Vérification sécurisée de la signature HMAC SHA256 du webhook.
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

// ------------------------------------------------------------------
// POST /api/payments/initialize
// ------------------------------------------------------------------
router.post('/initialize', async (req, res) => {
  try {
    // Les champs sont bien extraits du corps de la requête (frontend)
    const { amount, email, phone, orderId, paymentMethod } = req.body

    if (!amount || !email || !phone || !orderId || !paymentMethod) {
      return res
        .status(400)
        .json({
          error: 'amount, email, phone, orderId et paymentMethod sont requis',
        })
    }

    // Créer une référence UUID interne (merchant_reference)
    const internalReference = crypto.randomUUID()

    // 1) Créer la transaction en DB avec l'UUID interne
    // NOTE: On stocke initialement l'UUID interne dans le champ 'reference'.
    let transaction = await prisma.transaction.create({
      data: {
        amount,
        customerEmail: email,
        customerPhone: phone,
        orderId,
        status: 'pending',
        reference: internalReference,
      },
    })

    const requestBody = {
      amount,
      currency: 'XAF',
      reference: internalReference, // Notre référence interne (merchant_reference)
      phone,
      email,
      payment_method: paymentMethod, // L'élément CRUCIAL pour le Push USSD (e.g., 'momo.mtn')
      description: `Commande PleinGaz #${orderId}`,
      callback: 'https://pleingaz-site-web.onrender.com/api/payments/callback',
    }

    console.log('➡️ Envoi à NotchPay:', JSON.stringify(requestBody, null, 2)) // LOG POUR DEBUG

    // 2) Appel NotchPay
    const notchPayResponse = await fetch('https://api.notchpay.co/payments', {
      method: 'POST',
      headers: {
        Authorization: `${process.env.NOTCH_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const notchPayData = await notchPayResponse.json()
    console.log('✅ NotchPay response:', JSON.stringify(notchPayData, null, 2))

    if (
      notchPayResponse.status === 201 &&
      notchPayData.transaction?.reference
    ) {
      const notchReference = notchPayData.transaction.reference // La référence 'trx.xxx'

      // 🚨 CORRECTION MAJEURE: Mettre à jour la DB avec la VRAIE référence NotchPay (trx.xxx)
      // pour que le polling (/verify) fonctionne avec cette référence.
      await prisma.transaction.update({
        where: { reference: internalReference }, // Cherche par l'UUID interne
        data: {
          reference: notchReference, // Stocke la référence NotchPay (trx.xxx)
          notchData: notchPayData.transaction,
        },
      })

      // 3) Retourne la référence NotchPay au front pour le polling
      res.json({
        success: true,
        // Pour le Push USSD réussi, authorization_url devrait être null.
        // S'il y a une URL, c'est qu'il y a un problème de payment_method ou de numéro.
        authorization_url: notchPayData.authorization_url,
        reference: notchReference, // Utilisez cette référence pour le Polling
        status: notchPayData.transaction.status,
        message: notchPayData.message,
      })
    } else {
      console.error(
        "Échec de l'initialisation de NotchPay avec l'erreur:",
        notchPayData.message
      )
      // Si NotchPay échoue, on marque la transaction en DB comme échouée
      await prisma.transaction.update({
        where: { reference: internalReference },
        data: { status: 'failed', notchData: notchPayData },
      })

      res.status(500).json({
        success: false,
        message:
          notchPayData.message || "Échec de l'initialisation de NotchPay.",
      })
    }
  } catch (err) {
    console.error('❌ Payment initialize error:', err)
    return res
      .status(500)
      .json({ error: "Erreur lors de l'initialisation du paiement" })
  }
})

// ------------------------------------------------------------------
// GET /api/payments/verify/:reference (Polling)
// ------------------------------------------------------------------
router.get('/verify/:reference', async (req, res) => {
  try {
    // La 'reference' ici est la référence NotchPay (trx.xxx)
    const { reference } = req.params

    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: { Authorization: `${process.env.NOTCH_PUBLIC_KEY}` },
      }
    )
    const data = await response.json()
    console.log('✅ Payment verification (Polling):', data)

    const txRef = data.transaction?.reference || reference

    // Si complet -> mettre à jour la DB
    if (data.transaction?.status === 'complete') {
      // On cherche par txRef qui est la référence NotchPay
      const transaction = await prisma.transaction.update({
        where: { reference: txRef },
        data: {
          status: 'complete',
          notchData: data.transaction,
          // Mettre à jour la commande si elle est liée (assurez-vous d'avoir bien 'include: { order: true }' si vous utilisez 'update')
          order: { update: { status: 'paid' } },
        },
      })
    }

    // Le polling renvoie toujours le statut actuel à l'interface
    return res.json({
      status: data.transaction?.status || 'pending',
      message: data.message || 'Verification successful',
      code: data.code || 200,
    })
  } catch (err) {
    console.error('❌ Payment verify error:', err)
    return res
      .status(500)
      .json({ error: 'Erreur lors de la vérification du paiement' })
  }
})

// ------------------------------------------------------------------
// POST /api/payments/webhook/notchpay
// ------------------------------------------------------------------
router.post(
  '/webhook/notchpay',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      // 1. Vérification de la signature
      const signatureHeader = req.headers['x-notch-signature'] || ''
      const payloadRaw = req.body ? req.body.toString('utf8') : ''
      const secret = process.env.NOTCHPAY_WEBHOOK_HASH

      const signature = signatureHeader.startsWith('sha256=')
        ? signatureHeader.split('=')[1]
        : signatureHeader

      const hmac = crypto.createHmac('sha256', secret || '')
      hmac.update(payloadRaw)
      const expected = hmac.digest('hex')

      if (!safeHexCompare(expected, signature)) {
        console.error('❌ Invalid webhook signature')
        return res.status(403).send('Invalid signature')
      }

      const event = JSON.parse(payloadRaw)
      console.log('📩 Webhook validé:', event.type, event.data || '') // Correction: use event.type directly

      const notchRef = event?.data?.reference // La référence trx.xxx de NotchPay

      if (!notchRef) {
        console.log('ℹ️ Webhook reçu sans référence NotchPay nécessaire.')
        return res.status(200).send('Webhook sans références')
      }

      // 2. Traitement des événements
      if (event.type === 'payment.complete') {
        // Le webhook est le moyen le plus fiable de confirmer. On met à jour.
        await prisma.transaction.updateMany({
          where: { reference: notchRef },
          data: {
            status: 'complete',
            notchData: event,
            // Utiliser une syntaxe pour l'update de la commande (selon votre modèle Prisma)
            order: { update: { status: 'paid' } },
          },
        })
        console.log('✅ Transaction mise à jour complete pour', notchRef)
      } else if (event.type === 'payment.failed') {
        await prisma.transaction.updateMany({
          where: { reference: notchRef },
          data: {
            status: 'failed',
            notchData: event,
            order: { update: { status: 'failed' } },
          },
        })
        console.log('❌ Transaction mise à jour failed pour', notchRef)
      } else if (event.type === 'payment.created') {
        // Ne rien faire de plus, la transaction est déjà 'pending'
        console.log('ℹ️ Événement reçu: transaction créée (pending).')
      } else {
        console.log('ℹ️ Événement reçu non géré:', event.type)
      }

      return res.status(200).send('Webhook reçu et validé')
    } catch (err) {
      console.error('Erreur Webhook:', err)
      return res.status(500).send('Erreur serveur')
    }
  }
)

// ------------------------------------------------------------------
// GET /api/payments/callback (Redirection client)
// ------------------------------------------------------------------
router.get('/callback', async (req, res) => {
  const reference = req.query.reference // La référence NotchPay (trx.xxx)

  if (!reference) {
    return res.redirect(`https://pleingaz-site-web.vercel.app/cart`)
  }

  try {
    // Vérification de sécurité après redirection
    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: {
          Authorization: `${process.env.NOTCH_PUBLIC_KEY}`,
        },
      }
    )
    const data = await response.json()
    console.log(
      '🔎 NotchPay verify response (Callback):',
      JSON.stringify(data, null, 2)
    )

    if (data.transaction?.status === 'complete') {
      const txRef = data.transaction.reference || reference

      // Mise à jour de la transaction (même si le webhook l'a déjà fait, c'est une sécurité)
      const transaction = await prisma.transaction.findUnique({
        where: { reference: txRef },
        include: { order: true },
      })

      if (transaction && transaction.status !== 'complete') {
        await prisma.transaction.update({
          where: { reference: txRef },
          data: {
            status: 'complete',
            notchData: data.transaction,
            order: { update: { status: 'paid' } },
          },
        })
      }
      return res.redirect(
        `https://pleingaz-site-web.vercel.app/order-confirmation?ref=${txRef}`
      )
    } else {
      // Redirection vers la page panier/échec si la transaction n'est pas complète
      return res.redirect(
        `https://pleingaz-site-web.vercel.app/cart?status=failed`
      )
    }
  } catch (error) {
    console.error('❌ Erreur de vérification du paiement (Callback):', error)
    return res.redirect(
      `https://pleingaz-site-web.vercel.app/cart?status=error`
    )
  }
})

export default router
