// src/components/HeroSection.jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Truck, ShieldCheck, Clock } from 'lucide-react'

import heroImage1 from '../assets/images/hero1.jpg'
import heroImage2 from '../assets/images/hero2.jpg'
import heroImage3 from '../assets/images/hero3.jpg'
import { NavLink } from 'react-router-dom'

const heroImages = [heroImage1, heroImage2, heroImage3]

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 10000)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <section className='relative w-full min-h-[550px] flex items-center overflow-hidden'>
      {/* ✅ Dégradé animé */}
      <div className='absolute inset-0 animate-gradient bg-[linear-gradient(270deg,#7f1d1d,#dc2626,#f87171,#ef4444,#991b1b)] bg-[length:400%_400%]' />

      {/* ✅ Overlay plus sombre pour petits écrans */}
      <div className='absolute inset-0 bg-black/50 md:hidden z-10'></div>

      {/* Colonne gauche */}
      <div className='container mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-12 md:py-20 relative z-20'>
        <div className='w-full md:w-1/2 text-white space-y-6'>
          <div className='flex justify-center'>
            <motion.h1
              initial={{ x: 150, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className='text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight font-montserrat text-center'
            >
              PLEINGAZ
            </motion.h1>
          </div>

          <motion.h2
            initial={{ x: -150, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className='text-3xl sm:text-4xl lg:text-5xl font-semibold italic text-white text-center'
          >
            Bouteilles Toujours Pleines
          </motion.h2>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
            className='text-lg sm:text-xl leading-relaxed text-gray-100 text-center max-w-2xl mx-auto'
          >
            Chez PLEINGAZ, nous croyons que l'accès à une énergie de qualité ne
            devrait jamais être un souci. C'est pourquoi nous vous garantissons
            une livraison rapide et des accessoires certifiés, pour votre
            sécurité et votre tranquillité d’esprit.
          </motion.p>

          <motion.div
            className='flex justify-center flex-wrap gap-6 md:gap-12 mt-8'
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className='flex items-center space-x-2'>
              <Truck className='h-8 w-8 text-white' />
              <span className='text-md sm:text-lg font-semibold'>
                Livraison Express
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <ShieldCheck className='h-8 w-8 text-white' />
              <span className='text-md sm:text-lg font-semibold'>
                Qualité Certifiée
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <Clock className='h-8 w-8 text-white' />
              <span className='text-md sm:text-lg font-semibold'>
                Service 24h
              </span>
            </div>
          </motion.div>

          <motion.div className='flex justify-center'>
            <NavLink to='/products'>
              <motion.button
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: 'easeOut', delay: 1.5 }}
                whileHover={{ scale: 1.1, rotate: [-1, 1, 0] }}
                whileTap={{ scale: 0.95 }}
                className='bg-white text-red-600 px-8 py-4 rounded-full text-lg font-bold shadow-lg 
                 transition-colors duration-500 ease-in-out 
                 hover:bg-slate-600 hover:text-white'
              >
                Découvrir nos offres
              </motion.button>
            </NavLink>
          </motion.div>
        </div>
      </div>

      {/* Colonne droite */}
      <div className='absolute right-0 top-0 h-full w-1/2'>
        {heroImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt="Famille utilisant l'énergie PLEINGAZ"
            className={`
              absolute top-0 left-0 w-full h-full object-cover 
              transition-all duration-[2000ms] ease-in-out
              ${
                index === currentImageIndex
                  ? 'opacity-100 transform scale-100'
                  : 'opacity-0 transform scale-110'
              }
            `}
            style={{
              clipPath: 'polygon(0% 0%, 100% 0, 100% 100%, 0% 100%, 25% 50%)',
            }}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroSection
