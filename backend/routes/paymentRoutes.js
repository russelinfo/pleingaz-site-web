// routes/paymentRoutes.js (code corrigé)
import express from 'express'
import fetch from 'node-fetch'
import crypto from 'crypto'
import dotenv from 'dotenv'
import prisma from '../prismaClient.js'

dotenv.config()
const router = express.Router()

/** helper signature verify (HMAC SHA256) */
function verifySignature(payload, signature, secret) {
  if (!signature || !secret) return false
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

/** POST /api/payments/initialize
 * body: { amount, currency?, name, email, phone, description?, orderData }
 */
router.post('/initialize', async (req, res) => {
  const {
    amount,
    currency = 'XAF',
    name,
    email,
    phone,
    description,
    orderData,
  } = req.body
  try {
    if (!amount || !email || !phone || !name || !orderData) {
      return res
        .status(400)
        .json({ error: 'amount, name, email, phone et orderData sont requis' })
    }

    // ✅ Étape 1 : Créer la commande dans la base de données
    const createdOrder = await prisma.order.create({
      data: {
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.deliveryAddress,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        status: 'pending_payment', // Nouveau statut pour les paiements en attente
        items: {
          create: orderData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    })
    console.log('✅ Commande créée:', createdOrder.id)

    // ✅ Étape 2 : Créer la transaction liée à la commande
    const reference = `pleingaz-${createdOrder.id}-${Date.now()}`
    const tx = await prisma.transaction.create({
      data: {
        reference,
        amount,
        currency,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        status: 'pending',
        orderId: createdOrder.id, // ✅ Lier la transaction à la commande
      },
    })
    console.log('✅ Transaction créée:', tx.id)

    // ✅ Étape 3 : Appel NotchPay
    const response = await fetch('https://api.notchpay.co/payments', {
      method: 'POST',
      headers: {
        Authorization: process.env.NOTCH_PUBLIC_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        customer: { name, email, phone },
        description:
          description || `Paiement pour commande #${createdOrder.id}`,
        callback:
          process.env.PAYMENT_CALLBACK_URL ||
          'https://pleingaz-site-web.onrender.com/api/payments/callback',
        reference,
      }),
    })

    const data = await response.json()
    console.log('✅ NotchPay response:', data)

    // ✅ Étape 4 : Stocker la réponse NotchPay
    await prisma.transaction.update({
      where: { reference },
      data: { notchData: data },
    })

    return res.json({ ...data, reference })
  } catch (err) {
    console.error('❌ Payment initialize error:', err)
    return res
      .status(500)
      .json({ error: "Erreur lors de l'initialisation du paiement" })
  }
})

/** GET /api/payments/verify/:reference */
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params
    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: { Authorization: process.env.NOTCH_PUBLIC_KEY },
      }
    )
    const data = await response.json()
    console.log('✅ Payment verification:', data)

    // Récupérer la transaction pour mettre à jour la commande
    const transaction = await prisma.transaction.findUnique({
      where: { reference },
    })

    if (data.transaction?.status === 'complete' && transaction) {
      await prisma.transaction.update({
        where: { reference },
        data: { status: 'complete', notchData: data },
      })
      if (transaction.orderId) {
        await prisma.order.update({
          where: { id: transaction.orderId },
          data: { status: 'paid' },
        })
      }
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
 * Webhook endpoint (NotchPay)
 */
router.post(
  '/webhook/notchpay',
  express.raw({ type: 'application/json' }), // body raw
  async (req, res) => {
    try {
      const signature = req.headers['x-notch-signature']
      const payload = req.body ? req.body.toString('utf8') : ''
      const secret = process.env.NOTCHPAY_WEBHOOK_HASH

      if (!signature) {
        console.log('🔎 Webhook test/validation reçu (pas de signature)')
        return res.status(200).send('Webhook endpoint verified')
      }

      if (!verifySignature(payload, signature, secret)) {
        console.error('❌ Invalid webhook signature')
        return res.status(403).send('Invalid signature')
      }

      const event = JSON.parse(payload)
      console.log('📩 Webhook validé:', event)

      const ref =
        event?.data?.merchant_reference ||
        event?.data?.trxref ||
        event?.data?.reference ||
        event?.data?.trxRef

      if (event.type === 'payment.complete' && ref) {
        const transaction = await prisma.transaction.update({
          where: { reference: ref },
          data: { status: 'complete', notchData: event },
        })
        console.log('✅ Transaction mise à jour en complete pour', ref)
        if (transaction.orderId) {
          await prisma.order.update({
            where: { id: transaction.orderId },
            data: { status: 'paid' },
          })
          console.log(
            `✅ Statut de la commande ${transaction.orderId} mis à jour en 'paid'.`
          )
        }
      } else if (event.type === 'payment.failed' && ref) {
        const transaction = await prisma.transaction.update({
          where: { reference: ref },
          data: { status: 'failed', notchData: event },
        })
        console.log('❌ Transaction mise à jour en failed pour', ref)
        if (transaction.orderId) {
          await prisma.order.update({
            where: { id: transaction.orderId },
            data: { status: 'failed_payment' },
          })
          console.log(
            `❌ Statut de la commande ${transaction.orderId} mis à jour en 'failed_payment'.`
          )
        }
      }

      return res.status(200).send('Webhook reçu et validé')
    } catch (error) {
      console.error('Erreur Webhook:', error)
      return res.status(500).send('Erreur serveur')
    }
  }
)

/** callback (utilisé quand l'utilisateur revient après paiement) */
router.get('/callback', async (req, res) => {
  const reference = req.query.reference
  try {
    const response = await fetch(
      `https://api.notchpay.co/payments/${reference}`,
      {
        headers: {
          Authorization: process.env.NOTCH_PUBLIC_KEY,
          'Content-Type': 'application/json',
        },
      }
    )
    const data = await response.json()
    console.log('🔎 NotchPay verify response:', JSON.stringify(data, null, 2))

    const txRef =
      data.transaction?.merchant_reference ||
      data.transaction?.trxref ||
      data.transaction?.reference ||
      reference

    const transaction = await prisma.transaction.findUnique({
      where: { reference: txRef },
    })

    if (data.transaction?.status === 'complete' && transaction) {
      // ✅ Mise à jour de la transaction et de la commande
      await prisma.transaction.update({
        where: { reference: txRef },
        data: { status: 'complete', notchData: data },
      })
      if (transaction.orderId) {
        await prisma.order.update({
          where: { id: transaction.orderId },
          data: { status: 'paid' },
        })
      }
      return res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 40px; background-color: #f7f7f7;">
          <h1 style="color: #4CAF50;">✅ Paiement réussi !</h1>
          <p style="font-size: 18px; color: #555;">Votre commande a été validée. Vous serez redirigé sous peu.</p>
          <p style="font-size: 14px; color: #888;">Référence: ${txRef}</p>
          <script>
            setTimeout(() => {
              window.location.href = 'https://pleingaz-site-web.onrender.com/order-confirmation?ref=${txRef}';
            }, 3000);
          </script>
        </div>
      `)
    } else {
      return res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 40px; background-color: #fff8f8;">
          <h1 style="color: #F44336;">⚠️ Échec du paiement.</h1>
          <p style="font-size: 18px; color: #555;">Votre paiement n'a pas pu être complété. Veuillez réessayer.</p>
          <p style="font-size: 14px; color: #888;">Référence: ${txRef}</p>
          <a href="https://pleingaz-site-web.onrender.com/cart" style="display: inline-block; margin-top: 20px; padding: 10px 20px; color: white; background-color: #F44336; border-radius: 5px; text-decoration: none;">Retour au panier</a>
        </div>
      `)
    }
  } catch (error) {
    console.error('❌ Error verifying payment:', error)
    return res.status(500).send('Error verifying payment')
  }
})

export default router
