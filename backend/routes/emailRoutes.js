// backend/routes/emailRoutes.js
import express from 'express'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()
const router = express.Router()

// Configuration du transporteur Nodemailer
const transporter = nodemailer.createTransport({
  host: `${process.env.EMAIL_HOST}`,
  port: `${process.env.EMAIL_PORT}`,
  secure: false, // true pour 465, false pour 587
  auth: {
    user: `${process.env.EMAIL_USER}`,
    pass: `${process.env.EMAIL_PASS}`,
  },
})

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

  try {
    const mailOptions = {
      from: `"${name}" <${email}>`, // L'adresse de l'utilisateur comme expéditeur
      to: `${process.env.EMAIL_USER}`, // L'adresse de réception (votre support)
      subject: `Nouveau message de contact PleinGaz : ${name}`,
      html: `
        <h3>Nouveau message de contact PleinGaz</h3>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    }

    await transporter.sendMail(mailOptions)

    console.log(`✅ Email de contact envoyé par ${name} (${email})`)
    res.json({ success: true, message: 'Message envoyé avec succès !' })
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email de contact:", error)
    res
      .status(500)
      .json({ success: false, message: "Échec de l'envoi du message." })
  }
})

export default router
