// routes/paymentRoutes.js
import express from 'express'
import fetch from 'node-fetch'
import crypto from 'crypto'
import dotenv from 'dotenv'
import prisma from '../prismaClient.js'

// IMPORTANT: Assurez-vous que .env contient NOTCH_PUBLIC_KEY et NOTCHPAY_WEBHOOK_HASH
dotenv.config()
const router = express.Router()

/** Helper: Comparaison sécurisée pour le Webhook Signature (HMAC SHA256) */
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
// POST /api/payments/initialize (Étape 1: Initialisation de la transaction)
// ------------------------------------------------------------------
router.post('/initialize', async (req, res) => {
  let transaction = null // Déclaration pour gestion d'erreur
  const internalReference = crypto.randomUUID() // Votre référence marchande (UUID)
  try {
    let { amount, email, phone, orderId, paymentMethod } = req.body

    if (!amount || !email || !phone || !orderId || !paymentMethod) {
      return res
        .status(400)
        .json({
          error:
            'Tous les champs sont requis: amount, email, phone, orderId et paymentMethod.',
        })
    } // 🛑 CORRECTION MAJEURE: Formatage robuste du numéro de téléphone au format E.164 (+237...)

    let formattedPhone = phone.toString().replace(/[^0-9]/g, '') // 1. Nettoyer // 2. Retirer les préfixes non désirés (0, +237, 237) pour isoler le numéro local
    if (formattedPhone.startsWith('0')) {
      formattedPhone = formattedPhone.substring(1)
    }
    if (formattedPhone.startsWith('237')) {
      formattedPhone = formattedPhone.substring(3)
    } // 3. Forcer le format E.164 (+237) pour l'API NotchPay
    const e164Phone = `+237${formattedPhone}` // 1) Créer la transaction en DB avec l'UUID interne
    transaction = await prisma.transaction.create({
      data: {
        amount,
        customerEmail: email,
        customerPhone: e164Phone,
        orderId,
        status: 'pending',
        reference: internalReference, // 👈 Stocke l'UUID interne (merchant_reference)
      },
    }) // 2) Appel NotchPay

    const notchPayResponse = await fetch('https://api.notchpay.co/payments', {
      method: 'POST',
      headers: {
        Authorization: `${process.env.NOTCH_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'XAF',
        reference: internalReference, // Votre référence unique
        phone: e164Phone, // Numéro au format +237xxxxxxxx
        email,
        payment_method: paymentMethod, // momo.mtn, momo.orange, ou card
        description: `Commande PleinGaz #${orderId}`,
        callback:
          'https://pleingaz-site-web.onrender.com/api/payments/callback',
      }),
    })

    const notchPayData = await notchPayResponse.json()
    if (
      notchPayResponse.status === 201 &&
      notchPayData.transaction?.reference
    ) {
      const notchReference = notchPayData.transaction.reference // La référence trx.xxx // 🛑 MISE À JOUR CRITIQUE : Remplacer l'UUID interne par la référence NotchPay (trx.xxx)

      await prisma.transaction.update({
        where: { reference: internalReference }, // Cherche par l'UUID interne
        data: {
          reference: notchReference, // 👈 Stocke la référence trx.xxx
          notchData: notchPayData.transaction,
          status: notchPayData.transaction.status, // Peut être 'pending' ou autre
        },
      }) // 3) Retourne la référence NotchPay (trx.xxx) au front pour le polling

      res.json({
        success: true,
        authorization_url: notchPayData.authorization_url, // Sera null pour Mobile Money
        reference: notchReference,
        status: notchPayData.transaction.status,
        message: notchPayData.message,
      })
    } else {
      console.error(
        "Échec de l'initialisation de NotchPay:",
        notchPayData.message,
        notchPayData.errors
      ) // Mettre à jour l'état de la transaction comme échouée
      if (transaction) {
        await prisma.transaction.update({
          where: { reference: internalReference },
          data: {
            status: 'failed',
            notchData: notchPayData,
            reference: 'FAILED_' + internalReference,
          },
        })
      }
      res.status(500).json({
        success: false,
        message:
          notchPayData.message ||
          "Échec de l'initialisation de NotchPay. Vérifiez les détails et la clé publique.",
      })
    }
  } catch (err) {
    console.error("❌ Erreur serveur lors de l'initialisation:", err) // Si une transaction a été créée mais l'appel a échoué pour une raison inconnue
    if (transaction && transaction.reference === internalReference) {
      await prisma.transaction.update({
        where: { reference: internalReference },
        data: { status: 'error', notchData: { message: err.message } },
      })
    }
    return res
      .status(500)
      .json({ error: "Erreur serveur lors de l'initialisation du paiement" })
  }
})

// ------------------------------------------------------------------
// GET /api/payments/verify/:reference (Étape 2: Polling depuis le Frontend)
// ------------------------------------------------------------------
router.get('/verify/:reference', async (req, res) => {
  try {
    // La 'reference' est la référence NotchPay (trx.xxx) envoyée par le front.
    const { reference } = req.params

    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: { Authorization: `${process.env.NOTCH_PUBLIC_KEY}` },
      }
    )
    const data = await response.json()

    const notchStatus = data.transaction?.status || 'error'

    if (notchStatus === 'complete' || notchStatus === 'failed') {
      // Mise à jour de la DB pour finaliser l'état
      const transaction = await prisma.transaction.updateMany({
        where: { reference: reference },
        data: { status: notchStatus, notchData: data },
      }) // Mise à jour de la commande associée si le paiement est réussi

      if (notchStatus === 'complete' && transaction.count > 0) {
        const associatedTransaction = await prisma.transaction.findFirst({
          where: { reference: reference },
        })
        if (associatedTransaction && associatedTransaction.orderId) {
          await prisma.order.update({
            where: { id: associatedTransaction.orderId },
            data: { status: 'paid' },
          })
        }
      }
    }

    return res.json({
      status: notchStatus, // Renvoie le statut exact (pending, complete, failed)
      message: data.message || 'Verification successful',
    })
  } catch (err) {
    console.error('❌ Erreur de vérification du paiement:', err)
    return res
      .status(500)
      .json({ error: 'Erreur serveur lors de la vérification' })
  }
})

// ------------------------------------------------------------------
// POST /api/payments/webhook/notchpay (Le moyen le plus fiable de mise à jour)
// ------------------------------------------------------------------
router.post(
  '/webhook/notchpay',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      // ... (Vérification de la signature inchangée - Cruciale pour la sécurité) ...
      const signatureHeader = req.headers['x-notch-signature'] || ''
      const payloadRaw = req.body ? req.body.toString('utf8') : ''
      const secret = process.env.NOTCHPAY_WEBHOOK_HASH // Assurez-vous d'avoir cette variable dans .env

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
      const notchRef = event?.data?.reference // La référence trx.xxx de NotchPay

      if (
        notchRef &&
        (event.type === 'payment.complete' || event.type === 'payment.failed')
      ) {
        const newStatus =
          event.type === 'payment.complete' ? 'complete' : 'failed'

        await prisma.transaction.updateMany({
          where: { reference: notchRef },
          data: {
            status: newStatus,
            notchData: event, // Mise à jour de la commande (si paiement complet)
            ...(newStatus === 'complete' && {
              order: { update: { status: 'paid' } },
            }),
          },
        })
        console.log(
          `✅ Transaction mise à jour par webhook (${newStatus}) pour ${notchRef}`
        )
      }

      return res.status(200).send('Webhook reçu et validé')
    } catch (err) {
      console.error('Erreur Webhook:', err)
      return res.status(500).send('Erreur serveur')
    }
  }
)

// ------------------------------------------------------------------
// GET /api/payments/callback (Pour la carte bancaire UNIQUEMENT)
// ------------------------------------------------------------------
router.get('/callback', async (req, res) => {
  const reference = req.query.reference // C'est la référence NotchPay (trx.xxx)
  const FRONTEND_URL = 'https://pleingaz-site-web.vercel.app' // URL de votre front-end
  try {
    // Vérification de l'état final de la transaction auprès de NotchPay
    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: { Authorization: `${process.env.NOTCH_PUBLIC_KEY}` },
      }
    )
    const data = await response.json()

    if (data.transaction?.status === 'complete') {
      // Mettre à jour la DB si le webhook ne l'a pas déjà fait
      const transaction = await prisma.transaction.updateMany({
        where: { reference: reference },
        data: {
          status: 'complete',
          notchData: data,
          order: { update: { status: 'paid' } },
        },
      })
      return res.redirect(`${FRONTEND_URL}/order-confirmation?ref=${reference}`)
    } else {
      // Paiement échoué ou en attente après redirection (erreur)
      return res.redirect(`${FRONTEND_URL}/cart?payment_status=failed`)
    }
  } catch (error) {
    console.error('❌ Erreur de vérification du paiement:', error)
    return res.redirect(`${FRONTEND_URL}/cart?payment_status=error`)
  }
})

export default router
