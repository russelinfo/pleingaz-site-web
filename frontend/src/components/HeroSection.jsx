// src/components/HeroSection.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { Truck, ShieldCheck, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

const HeroSection = () => {
  const { t } = useTranslation()

  return (
    <section className='relative w-full min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-yellow-500 text-white'>
      {/* ✅ Contenu principal centré */}
      <div className='text-center px-6 max-w-4xl'>
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className='text-6xl sm:text-7xl font-extrabold tracking-tight mb-4 font-montserrat'
        >
          PLEINGAZ
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className='text-2xl sm:text-3xl italic font-semibold mb-6'
        >
          {t('Bouteilles Toujours Pleines')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className='text-lg sm:text-xl leading-relaxed text-gray-100 mb-10'
        >
          {t(
            "Depuis 2015, PleinGaz alimente les foyers du Cameroun avec fiabilité, sécurité et passion. Notre mission est simple : offrir une énergie accessible à tous, grâce à un réseau solide, des produits certifiés et un service de proximité. Avec PleinGaz, chaque foyer profite d’une énergie sûre et toujours disponible."
          )}
        </motion.p>

        {/* ✅ Icônes et avantages */}
        <motion.div
          className='flex justify-center flex-wrap gap-8 mb-12'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className='flex items-center space-x-2'>
            <Truck className='h-7 w-7 text-white' />
            <span className='text-lg font-semibold'>
              {t('Livraison Express')}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <ShieldCheck className='h-7 w-7 text-white' />
            <span className='text-lg font-semibold'>
              {t('Qualité Certifiée')}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <Clock className='h-7 w-7 text-white' />
            <span className='text-lg font-semibold'>{t('Service 24h')}</span>
          </div>
        </motion.div>

        {/* ✅ Bouton principal */}
        <NavLink to='/products'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='bg-white text-red-700 px-8 py-4 rounded-full text-lg font-bold shadow-lg 
             hover:bg-gray-100 transition-all duration-300'
          >
            {t('Découvrir nos offres')}
          </motion.button>
        </NavLink>
      </div>

      {/* ✅ Dégradé animé subtil */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none' />
    </section>
  )
}

export default HeroSection
