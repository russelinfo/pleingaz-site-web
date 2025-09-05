// src/components/HeroSection.jsx
import React, { useState, useEffect } from 'react'
// Importe les trois images que tu as fournies
import heroImage1 from '../assets/images/hero1.jpg'
import heroImage2 from '../assets/images/hero2.jpg'
import heroImage3 from '../assets/images/hero3.jpg'

const heroImages = [heroImage1, heroImage2, heroImage3]

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    // Fait changer l'image toutes les 10 secondes
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 10000) // 10000 millisecondes = 10 secondes

    // Nettoyage de l'intervalle lorsque le composant est démonté
    return () => clearInterval(intervalId)
  }, [])

  return (
    <section className='relative w-full min-h-[550px] flex items-center bg-red-600 overflow-hidden'>
      {/* Colonne gauche : Texte */}
      <div className='container mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-12 md:py-20 relative z-10'>
        <div className='w-full md:w-1/2 text-white text-center md:text-left space-y-6 z-20'>
          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight'>
            Votre énergie au quotidien avec PLEINGAZ
          </h1>
          <p className='text-lg sm:text-xl leading-relaxed'>
            Découvrez nos solutions énergétiques adaptées à vos besoins, pour la
            maison ou l'entreprise.
          </p>
          <button className='bg-white text-red-600 px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105'>
            Découvrir nos offres
          </button>
        </div>
      </div>

      {/* Colonne droite : Image avec découpe concave et transition améliorée */}
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
