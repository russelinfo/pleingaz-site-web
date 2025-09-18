// src/pages/Contact.jsx
import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const Contact = () => {
  const { t } = useTranslation()

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12'>
      {/* Titre */}
      <h1 className='text-4xl md:text-5xl font-extrabold text-gray-900 mb-4'>
        {t('Contactez-nous')}
      </h1>
      <p className='text-lg text-gray-600 mb-10 text-center max-w-2xl'>
        {t(
          'Une question, un projet ou simplement envie d’échanger ? Remplissez le formulaire ou utilisez les informations ci-dessous pour nous joindre.'
        )}
      </p>

      <div className='grid md:grid-cols-2 gap-10 w-full max-w-5xl'>
        {/* Infos de contact */}
        <div className='bg-white rounded-2xl shadow-lg p-8 space-y-6'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>
            {t('Nos coordonnées')}
          </h2>
          <div className='flex items-center space-x-4'>
            <Mail className='text-red-600 w-6 h-6' />
            <span className='text-gray-700'>support@pleingaz.com</span>
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

        {/* Formulaire */}
        <form className='bg-white rounded-2xl shadow-lg p-8 space-y-6'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>
            {t('Envoyez-nous un message')}
          </h2>

          <div>
            <label className='block text-gray-700 font-medium'>
              {t('Nom')}
            </label>
            <input
              type='text'
              placeholder={t('Votre nom')}
              className='w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none'
            />
          </div>

          <div>
            <label className='block text-gray-700 font-medium'>
              {t('Email')}
            </label>
            <input
              type='email'
              placeholder={t('votre@email.com')}
              className='w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none'
            />
          </div>

          <div>
            <label className='block text-gray-700 font-medium'>
              {t('Message')}
            </label>
            <textarea
              rows='4'
              placeholder={t('Votre message...')}
              className='w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none'
            ></textarea>
          </div>

          <button
            type='submit'
            className='w-full bg-red-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-red-700 transition'
          >
            {t('Envoyer')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Contact
