// backend/routes/emailRoutes.js
import express from 'express'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()
const router = express.Router()

// ✅ Configuration corrigée du transporteur Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // 🔥 Utiliser le service Gmail directement
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true pour 465, false pour 587
  auth: {
    user: process.env.EMAIL_USER, // ✅ Supprimer les template literals inutiles
    pass: process.env.EMAIL_PASS,
  },
  // 🔥 Options supplémentaires pour résoudre les timeouts
  connectionTimeout: 60000, // 60 secondes
  greetingTimeout: 30000, // 30 secondes
  socketTimeout: 60000, // 60 secondes
  // Options de sécurité pour les environnements cloud
  tls: {
    rejectUnauthorized: false,
  },
})

// ✅ Fonction pour vérifier la connexion au démarrage
const verifyEmailConnection = async () => {
  try {
    await transporter.verify()
    console.log('✅ Connexion SMTP établie avec succès')
  } catch (error) {
    console.error('❌ Erreur de connexion SMTP:', error)
  }
}

// Vérifier la connexion au démarrage
verifyEmailConnection()

/**
 * POST /api/emails/contact
 * Gère l'envoi du formulaire de contact.
 */
router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Tous les champs sont requis.',
    })
  }

  // Validation email basique
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Adresse email invalide.',
    })
  }

  try {
    // ✅ Configuration du mail corrigée
    const mailOptions = {
      from: process.env.EMAIL_USER, // 🔥 Utiliser votre email comme expéditeur
      to: process.env.EMAIL_USER, // Destination (votre email)
      replyTo: email, // 🔥 Email de l'utilisateur en réponse
      subject: `Nouveau message de contact PleinGaz : ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
            Nouveau message de contact PleinGaz
          </h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nom:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3>Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
            Ce message a été envoyé depuis le formulaire de contact de PleinGaz.
          </p>
        </div>
      `,
      text: `Nouveau message de contact PleinGaz\n\nNom: ${name}\nEmail: ${email}\nMessage: ${message}`, // Version texte
    }

    // Envoi avec timeout personnalisé
    const info = await transporter.sendMail(mailOptions)

    console.log(
      `✅ Email de contact envoyé par ${name} (${email}) - ID: ${info.messageId}`
    )

    res.json({
      success: true,
      message: 'Message envoyé avec succès !',
    })
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error)

    // Messages d'erreur plus spécifiques
    let errorMessage = "Échec de l'envoi du message."

    if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Timeout de connexion. Veuillez réessayer.'
    } else if (error.code === 'EAUTH') {
      errorMessage = "Erreur d'authentification email."
    } else if (error.code === 'EMESSAGE') {
      errorMessage = 'Erreur dans le format du message.'
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
    })
  }
})

// ✅ Route de test pour vérifier la configuration
router.get('/test', async (req, res) => {
  try {
    await transporter.verify()
    res.json({ success: true, message: 'Configuration SMTP valide' })
  } catch (error) {
    console.error('Test SMTP échoué:', error)
    res
      .status(500)
      .json({
        success: false,
        message: 'Configuration SMTP invalide',
        error: error.message,
      })
  }
})

export default router
