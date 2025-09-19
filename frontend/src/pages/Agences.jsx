// src/pages/Agences.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'

const Agences = () => {
  const { t } = useTranslation()

  return (
    <div className='min-h-screen w-full'>
      {/* Titre au-dessus */}
      <div className='text-center py-6 bg-white shadow-md'>
        <h1 className='text-3xl font-bold'>{t('agencies.title')}</h1>
        <p className='text-gray-600'>{t('agencies.description')}</p>
      </div>

      {/* Carte Google en plein écran largeur */}
      <iframe
        src='https://www.google.com/maps/d/embed?mid=1-QaFMsM1sKrPvNInK5Hn7P-4pjvJDWc'
        width='100%'
        height='800'
        style={{ border: '0' }}
        allowFullScreen
        loading='lazy'
      ></iframe>
    </div>
  )
}

export default Agences
