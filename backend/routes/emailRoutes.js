// backend/routes/emailRoutes.js
import express from 'express'
import { Resend } from 'resend'
import dotenv from 'dotenv'
import prisma from '../prismaClient.js'

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
  const RECIPIENT_EMAIL = 'sales@monpleingaz.com'

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

router.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'L\'email est requis.' });
  }

  // (Optionnel : Ajoutez ici une validation d'email plus robuste si vous le souhaitez)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Adresse email invalide.' })
  }

  try {
    // 1. Vérifier si l'abonné existe déjà
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      // 409 Conflict : l'utilisateur est déjà abonné
      return res.status(409).json({ success: false, message: 'Cet email est déjà abonné.' });
    }

    // 2. Créer l'abonné dans la base de données
    await prisma.subscriber.create({
      data: { email },
    });

    console.log(`✅ Nouvel abonné enregistré: ${email}`);
    
    res.json({ success: true, message: 'Inscription à la newsletter réussie !' });
  } catch (error) {
    console.error('❌ Erreur lors de l\'abonnement à la newsletter:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de l\'abonnement.' });
  }
});

export default router
