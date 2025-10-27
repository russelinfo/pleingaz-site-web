// src/components/HeroSection.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { Truck, ShieldCheck, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

const HeroSection = () => {
  const { t } = useTranslation()

  return (
    <section className='relative w-full min-h-[620px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-red-800 via-red-600 to-orange-500 text-white'>
      {/* ✅ Dégradé d’arrière-plan animé */}
      <motion.div
        className='absolute inset-0 bg-[linear-gradient(270deg,#7f1d1d,#dc2626,#f87171,#ef4444,#991b1b)] bg-[length:400%_400%]'
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />

      {/* ✅ Contenu principal */}
      <div className='relative z-10 container mx-auto px-6 py-20 text-center flex flex-col items-center space-y-8'>
        {/* ✅ Titre principal */}
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className='text-5xl sm:text-6xl lg:text-7xl font-extrabold font-montserrat tracking-wide'
        >
          PLEINGAZ
        </motion.h1>

        {/* ✅ Slogan */}
        <motion.h2
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          className='text-2xl sm:text-3xl lg:text-4xl italic font-semibold'
        >
          {t('Bouteilles Toujours Pleines')}
        </motion.h2>

        {/* ✅ Message principal modernisé */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className='max-w-3xl text-lg sm:text-xl leading-relaxed text-gray-100'
        >
          {t(
            'Depuis 2015, PleinGaz alimente les foyers du Cameroun avec fiabilité, sécurité et passion. \
            Notre mission est simple : offrir une énergie accessible à tous, grâce à un réseau solide, \
            des produits certifiés et un service de proximité. \
            Avec PleinGaz, chaque foyer profite d’une énergie sûre et toujours disponible.'
          )}
        </motion.p>

        {/* ✅ Icônes de confiance */}
        <motion.div
          className='flex justify-center flex-wrap gap-8 mt-10'
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className='flex flex-col items-center space-y-2'>
            <Truck className='h-10 w-10 text-white' />
            <span className='font-semibold'>{t('Livraison Express')}</span>
          </div>
          <div className='flex flex-col items-center space-y-2'>
            <ShieldCheck className='h-10 w-10 text-white' />
            <span className='font-semibold'>{t('Qualité Certifiée')}</span>
          </div>
          <div className='flex flex-col items-center space-y-2'>
            <Clock className='h-10 w-10 text-white' />
            <span className='font-semibold'>{t('Service 24h/24')}</span>
          </div>
        </motion.div>

        {/* ✅ Bouton principal */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          <NavLink to='/products'>
            <motion.button
              whileHover={{ scale: 1.1, rotate: [-1, 1, 0] }}
              whileTap={{ scale: 0.95 }}
              className='bg-white text-red-700 px-10 py-4 rounded-full text-lg font-bold shadow-lg transition-colors duration-500 hover:bg-slate-700 hover:text-white'
            >
              {t('Découvrir nos offres')}
            </motion.button>
          </NavLink>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
