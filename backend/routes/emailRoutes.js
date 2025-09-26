// backend/routes/emailRoutes.js
import express from 'express'
import { Resend } from 'resend'
import dotenv from 'dotenv'

dotenv.config()
const router = express.Router()

// Initialisation de Resend
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * POST /api/emails/contact
 * Gère l'envoi du formulaire de contact.
 * body: { name, email, message }
 */
router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, message: 'Tous les champs sont requis.' })
  }

  // 🎯 Remplacez par votre propre adresse e-mail pour recevoir les messages
  const RECIPIENT_EMAIL = 'yemelirussel@gmail.com'

  try {
    const { data, error } = await resend.emails.send({
      from: 'PleinGaz Contact <onboarding@resend.dev>', // 👈 Expéditeur de test (doit être utilisé pour le développement)
      to: [RECIPIENT_EMAIL], // 👈 Destinataire (vous)
      replyTo: email,
      subject: `Nouveau message de contact : ${name}`,
      html: `
        <h3>Nouveau message de contact PleinGaz</h3>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    })

    if (error) {
      throw new Error(error.message)
    }

    console.log(`✅ Email de contact envoyé via Resend - ID: ${data.id}`)
    res.json({ success: true, message: 'Message envoyé avec succès !' })
  } catch (error) {
    console.error("❌ Erreur Resend lors de l'envoi du contact:", error)
    res
      .status(500)
      .json({ success: false, message: "Échec de l'envoi du message." })
  }
})

export default router
