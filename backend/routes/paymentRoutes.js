// routes/paymentRoutes.js
import express from 'express'
import fetch from 'node-fetch'
import crypto from 'crypto'
import dotenv from 'dotenv'
import prisma from '../prismaClient.js'

dotenv.config()
const router = express.Router()

/** helper signature verify (HMAC SHA256) */
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

// 🎯 Nous allons utiliser le champ 'reference' de la DB pour stocker
// la référence NotchPay (trx.xxx) afin que le polling fonctionne.
// L'UUID interne sera utilisé comme merchant_reference dans NotchPay.

// ------------------------------------------------------------------
// POST /api/payments/initialize
// ------------------------------------------------------------------
router.post('/initialize', async (req, res) => {
  try {
    // Note : On a besoin de paymentMethod ici pour l'USSD push
    let { amount, email, phone, orderId, paymentMethod } = req.body // 👈 Utiliser 'let' pour 'phone'

    if (!amount || !email || !phone || !orderId || !paymentMethod) {
      return res.status(400).json({
        error: 'amount, email, phone, orderId et paymentMethod sont requis',
      })
    }

    // 🛑 CORRECTION: Formatage de sécurité du numéro de téléphone avec +237
    let formattedPhone = phone.replace(/[^0-9+]/g, '').replace(/\s/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = formattedPhone.substring(1)
    }
    if (!formattedPhone.startsWith('+237')) {
      if (formattedPhone.startsWith('237')) {
        formattedPhone = '+' + formattedPhone
      } else {
        formattedPhone = '+237' + formattedPhone
      }
    }
    formattedPhone = formattedPhone.replace(/^\+\+/, '+')
    phone = formattedPhone // 👈 Mettre à jour la variable 'phone' pour l'appel NotchPay // Créer une référence UUID interne pour le tracking (merchant_reference)
    // Fin du formatage de sécurité

    const internalReference = crypto.randomUUID() // 1) Créer la transaction en DB avec l'UUID interne

    let transaction = await prisma.transaction.create({
      data: {
        amount,
        customerEmail: email,
        customerPhone: phone, // Le numéro formaté est utilisé ici
        orderId,
        status: 'pending',
        reference: internalReference, // Stocke l'UUID interne ici initialement
      },
    }) // 2) Appel NotchPay

    const notchPayResponse = await fetch(
      'https://api.notchpay.co/payments', // ✅ Endpoint correct pour USSD Push
      {
        method: 'POST',
        headers: {
          Authorization: `${process.env.NOTCH_PUBLIC_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'XAF',
          reference: internalReference, // C'est votre merchant_reference
          phone, // Le numéro formaté est utilisé ici
          email,
          payment_method: paymentMethod, // ✅ Ajout du mode de paiement
          description: `Commande PleinGaz #${orderId}`,
          callback:
            'https://pleingaz-site-web.onrender.com/api/payments/callback',
        }),
      }
    )

    const notchPayData = await notchPayResponse.json()
    console.log('✅ NotchPay response:', JSON.stringify(notchPayData, null, 2))

    if (
      notchPayResponse.status === 201 &&
      notchPayData.transaction?.reference
    ) {
      const notchReference = notchPayData.transaction.reference // 🚨 CORRECTION MAJEURE : Mettre à jour la DB avec la VRAIE référence NotchPay // pour que le polling (/verify) fonctionne.

      await prisma.transaction.update({
        where: { reference: internalReference }, // Cherche par l'UUID interne
        data: {
          // Stocke la référence NotchPay (trx.xxx) pour le polling
          reference: notchReference,
          notchData: notchPayData.transaction, // On pourrait ajouter un champ 'internalRef' pour garder l'UUID, mais on simplifie ici.
        },
      }) // 3) Retourne la référence NotchPay au front pour le polling

      res.json({
        success: true, // Pour le Polling USSD : l'URL est souvent nulle, on renvoie la référence
        authorization_url: notchPayData.authorization_url,
        reference: notchReference, // Utilisez cette référence pour le Polling
        status: notchPayData.transaction.status,
        message: notchPayData.message,
      })
    } else {
      console.error(
        "Échec de l'initialisation de NotchPay avec l'erreur:",
        notchPayData.message
      ) // Revert the transaction status to failed or delete it if possible
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
// GET /api/payments/verify/:reference
// ------------------------------------------------------------------
router.get('/verify/:reference', async (req, res) => {
  try {
    // La 'reference' ici est maintenant la référence NotchPay (trx.xxx)
    const { reference } = req.params // Le code d'appel à NotchPay est correct

    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: { Authorization: `${process.env.NOTCH_PUBLIC_KEY}` },
      }
    )
    const data = await response.json()
    console.log('✅ Payment verification:', data) // Si complete -> mettre à jour la DB

    const txRef = data.transaction?.reference || reference

    if (data.transaction?.status === 'complete') {
      // 🚨 CORRECTION : On cherche par txRef qui est la référence NotchPay (stockée dans le champ 'reference' de la DB)
      await prisma.transaction.updateMany({
        where: { reference: txRef },
        data: { status: 'complete', notchData: data },
      }) // Mise à jour de la commande associée (ajoutez cette étape si elle est manquante)
      const transaction = await prisma.transaction.findFirst({
        where: { reference: txRef },
      })
      if (transaction && transaction.orderId) {
        await prisma.order.update({
          where: { id: transaction.orderId },
          data: { status: 'paid' },
        })
      }
    }

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
      // ... (vérification de la signature inchangée) ...
      const signatureHeader = req.headers['x-notch-signature'] || ''
      const payloadRaw = req.body ? req.body.toString('utf8') : ''
      const secret = process.env.NOTCHPAY_WEBHOOK_HASH // ... (log de debug et vérification de signature inchangée) ...

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
      console.log('📩 Webhook validé:', event?.type, event?.data || '') // 🚨 CORRECTION : On utilise le merchant_reference (votre UUID interne)

      const merchantRef = event?.data?.merchant_reference
      const notchRef = event?.data?.reference // La référence trx.xxx de NotchPay

      if (!merchantRef || !notchRef) {
        console.log(
          'ℹ️ Webhook reçu sans références nécessaires (merchant_reference ou Notch Reference).'
        )
        return res.status(200).send('Webhook sans références')
      } // Le webhook est le moyen le plus sûr de mettre à jour la DB.

      if (event.type === 'payment.complete') {
        await prisma.transaction.updateMany({
          where: { reference: notchRef }, // On cherche la référence NotchPay si elle a été mise à jour à l'initialize
          data: {
            status: 'complete',
            notchData: event, // S'assurer de mettre à jour le statut de la commande liée
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
// GET /api/payments/callback
// ------------------------------------------------------------------
router.get('/callback', async (req, res) => {
  const reference = req.query.reference
  try {
    // 🚨 CORRECTION : La vérification est correcte, elle utilise la référence NotchPay (trx.xxx)
    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: {
          Authorization: `${process.env.NOTCH_PUBLIC_KEY}`,
        },
      }
    )
    const data = await response.json()
    console.log('🔎 NotchPay verify response:', JSON.stringify(data, null, 2))

    if (data.transaction?.status === 'complete') {
      const txRef = data.transaction.reference || reference // C'est la référence NotchPay (trx.xxx) // On cherche par la référence NotchPay (txRef)

      const transaction = await prisma.transaction.findUnique({
        where: { reference: txRef },
        include: { order: true },
      })

      if (transaction && transaction.status !== 'complete') {
        await prisma.transaction.update({
          where: { reference: txRef },
          data: {
            status: 'complete',
            notchData: data,
            order: { update: { status: 'paid' } },
          },
        })
      }
      return res.redirect(
        `https://pleingaz-site-web.vercel.app/order-confirmation?ref=${txRef}`
      )
    } else {
      return res.redirect(`https://pleingaz-site-web.vercel.app/cart`)
    }
  } catch (error) {
    console.error('❌ Erreur de vérification du paiement:', error)
    return res.redirect(`https://pleingaz-site-web.vercel.app/cart`)
  }
})

export default router
