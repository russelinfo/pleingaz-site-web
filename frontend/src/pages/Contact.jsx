// src/pages/Contact.jsx
import React, { useState } from 'react' // ✅ Import de useState
import { Mail, Phone, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SocialSidebar from '../components/SocialSidebar'

const Contact = () => {
  const { t } = useTranslation()

  // ✅ ÉTATS DU FORMULAIRE
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitMessage, setSubmitMessage] = useState({ text: '', type: '' })

  // ✅ FONCTION DE SOUMISSION DU FORMULAIRE
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setSubmitMessage({ text: '', type: '' }) // Réinitialiser le message

    try {
      const response = await fetch(
        'https://pleingaz-site-web.onrender.com/api/emails/contact', // 💡 Mettez à jour avec l'URL de votre backend
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitMessage({
          text: t(
            'Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.'
          ),
          type: 'success',
        })
        // Réinitialiser les champs
        setName('')
        setEmail('')
        setMessage('')
      } else {
        throw new Error(
          data.message ||
            t("Une erreur est survenue lors de l'envoi. Veuillez réessayer.")
        )
      }
    } catch (error) {
      console.error("Erreur d'envoi du message:", error)
      setSubmitMessage({ text: error.message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12'>
      <SocialSidebar />
      {/* Titre (inchangé) */}
      <h1 className='text-4xl md:text-5xl font-extrabold text-gray-900 mb-4'>
        {t('Contactez-nous')}
      </h1>
      <p className='text-lg text-gray-600 mb-10 text-center max-w-2xl'>
        {t(
          'Une question, un projet ou simplement envie d’échanger ? Remplissez le formulaire ou utilisez les informations ci-dessous pour nous joindre.'
        )}
      </p>

      <div className='grid md:grid-cols-2 gap-10 w-full max-w-5xl'>
        {/* Infos de contact (inchangé) */}
        <div className='bg-white rounded-2xl shadow-lg p-8 space-y-6'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>
            {t('Nos coordonnées')}
          </h2>
          <div className='flex items-center space-x-4'>
            <Mail className='text-red-600 w-6 h-6' />
            <span className='text-gray-700'>sales@monpleingaz.com</span>
          </div>
          <div className='flex items-center space-x-4'>
            <Phone className='text-red-600 w-6 h-6' />
            <span className='text-gray-700'>+237 6 80 00 00 75</span>
          </div>
          <div className='flex items-center space-x-4'>
            <MapPin className='text-red-600 w-6 h-6' />
            <span className='text-gray-700'>{t('Yaoundé, Cameroun')}</span>
          </div>
        </div>

        {/* Formulaire (MIS À JOUR) */}
        <form
          className='bg-white rounded-2xl shadow-lg p-8 space-y-6'
          onSubmit={handleSubmit} // ✅ Ajout du gestionnaire de soumission
        >
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>
            {t('Envoyez-nous un message')}
          </h2>

          {/* Message de soumission */}
          {submitMessage.text && (
            <div
              className={`p-3 rounded-xl font-medium ${
                submitMessage.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {submitMessage.text}
            </div>
          )}

          <div>
            <label className='block text-gray-700 font-medium'>
              {t('Nom')}
            </label>
            <input
              type='text'
              value={name} // ✅ Lien avec l'état
              onChange={(e) => setName(e.target.value)} // ✅ Gestionnaire d'état
              placeholder={t('Votre nom')}
              className='w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none'
              required
            />
          </div>

          <div>
            <label className='block text-gray-700 font-medium'>
              {t('Email')}
            </label>
            <input
              type='email'
              value={email} // ✅ Lien avec l'état
              onChange={(e) => setEmail(e.target.value)} // ✅ Gestionnaire d'état
              placeholder={t('votre@email.com')}
              className='w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none'
              required
            />
          </div>

          <div>
            <label className='block text-gray-700 font-medium'>
              {t('Message')}
            </label>
            <textarea
              rows='4'
              value={message} // ✅ Lien avec l'état
              onChange={(e) => setMessage(e.target.value)} // ✅ Gestionnaire d'état
              placeholder={t('Votre message...')}
              className='w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none'
              required
            ></textarea>
          </div>

          <button
            type='submit'
            className='w-full bg-red-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-red-700 transition disabled:opacity-50'
            disabled={isLoading} // ✅ Désactivé pendant l'envoi
          >
            {isLoading ? t('Envoi en cours...') : t('Envoyer')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Contact
