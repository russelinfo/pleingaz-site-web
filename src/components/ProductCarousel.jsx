// src/components/ProductCarousel.jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Import images
import btn6 from '../assets/images/btn6.png'
import btn125 from '../assets/images/btn12.5.png'
import btn50 from '../assets/images/btn50.png'
import vitrer from '../assets/images/vitrer.png'
import classic from '../assets/images/classic.png'
import detenteur from '../assets/images/detenteur.png'
import detenteur2 from '../assets/images/detenteur2.png'
import tuyo from '../assets/images/tuyo.png'
import bruleur from '../assets/images/bruleur.png'

const products = [
  {
    name: 'Bouteille de gaz 6 kg',
    image: btn6,
    description:
      'La solution compacte et pratique pour la maison et les loisirs.',
    fullPrice: '19.120 XAF',
    emptyPrice: '3.120 XAF',
    rating: 4.5,
    isGasBottle: true,
  },
  {
    name: 'Bouteille de gaz 12.5 kg',
    image: btn125,
    description:
      'Notre bouteille standard, idéale pour un usage familial au quotidien.',
    fullPrice: '46.500 XAF',
    emptyPrice: '6.500 XAF',
    rating: 5,
    isGasBottle: true,
  },
  {
    name: 'Bouteille de gaz 50 kg',
    image: btn50,
    description:
      'La solution économique et durable pour les professionnels et les grands foyers.',
    fullPrice: '76.000 XAF',
    emptyPrice: '26.000 XAF',
    rating: 4.8,
    isGasBottle: true,
  },
  {
    name: 'Plaque à gaz en vitrer',
    image: vitrer,
    description: 'Design moderne et élégant pour votre cuisine.',
    price: '18.000 XAF',
    rating: 4.2,
    isGasBottle: false,
  },
  {
    name: 'Plaque à gaz classique',
    image: classic,
    description: 'Une solution simple et robuste pour une cuisine efficace.',
    price: '15.000 XAF',
    rating: 4.0,
    isGasBottle: false,
  },
  {
    name: 'Détendeur PleinGaz 6 kg',
    image: detenteur,
    description: 'Sécurité et fiabilité pour une utilisation sans souci.',
    price: '3.000 XAF',
    rating: 4.7,
    isGasBottle: false,
  },
  {
    name: 'Détendeur PleinGaz 12.5',
    image: detenteur2,
    description: 'Sécurité et fiabilité pour une utilisation sans souci.',
    poids: '6 kg',
    price: '3.000 XAF',
    rating: 4.7,
    isGasBottle: false,
  },
  {
    name: 'Tuyau de gaz 1.5m',
    image: tuyo,
    taille: '1.5 m',
    description: 'Tuyau flexible pour une connexion facile et sécurisée.',
    price: '2.000 XAF',
    rating: 4.9,
    isGasBottle: false,
  },
  {
    name: 'Bruleur à gaz',
    image: bruleur,
    description: 'Un moyens simple et efficace pour cuisiner au gaz.',
    price: '15.000 XAF',
    rating: 4.0,
    isGasBottle: false,
  },
]

const ProductCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Autoplay toutes les 6s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1))
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1))
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
      >
        ★
      </span>
    ))
  }

  return (
    <section className='bg-white py-24 relative overflow-hidden'>
      <div className='container mx-auto px-4'>
        {/* ✅ Titre */}
        <div className='flex items-center mb-6'>
          <div className='w-96 h-1 bg-red-600 mr-4' />
          <h2 className='text-3xl font-extrabold text-gray-800 whitespace-nowrap'>
            Nos produits, votre énergie
          </h2>
        </div>

        {/* ✅ Texte animé */}
        <motion.div
          className='flex justify-start'
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          <p className='text-gray-600 max-w-3xl text-lg leading-relaxed'>
            Explorez notre gamme de solutions énergétiques de haute qualité.
          </p>
        </motion.div>

        {/* ✅ Plus d’espace avec le carrousel */}
        <div className='mt-16 relative flex flex-col items-center justify-center w-full'>
          <div className='flex justify-center items-center w-full h-[500px] relative'>
            {products.map((product, index) => {
              const offset =
                (index - currentIndex + products.length) % products.length
              let transformStyle = ''
              let opacity = 0
              let zIndex = 0

              if (offset === 0) {
                transformStyle = 'translateX(0) scale(1)'
                opacity = 1
                zIndex = 30
              } else if (offset === 1) {
                transformStyle = 'translateX(400px) scale(0.9)'
                opacity = 0.7
                zIndex = 20
              } else if (offset === products.length - 1) {
                transformStyle = 'translateX(-400px) scale(0.9)'
                opacity = 0.7
                zIndex = 20
              } else {
                transformStyle = 'scale(0.8)'
                opacity = 0
                zIndex = 10
              }

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 100, scale: 0.8 }}
                  animate={{ opacity, transform: transformStyle }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className='absolute w-[340px]'
                  style={{ zIndex }}
                >
                  {/* ✅ Carte produit avec fond blanc + ombre forte */}
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      y: -10,
                      boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.25)', // Ombre forte
                    }}
                    transition={{ duration: 0.3 }}
                    className='bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center p-6 border border-gray-200'
                  >
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className='h-48 object-contain mb-4'
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />

                    {/* Zone produit */}
                    <div className='bg-red-600 w-full rounded-b-2xl p-4 -mx-6 text-center shadow-md'>
                      <h3 className='text-xl font-semibold text-white mb-2'>
                        {product.name}
                      </h3>
                      <p className='text-sm text-gray-100 mb-4'>
                        {product.description}
                      </p>

                      <div className='flex items-center justify-center mb-2'>
                        {renderStars(product.rating)}
                        <span className='ml-2 text-gray-100 text-sm'>
                          ({product.rating})
                        </span>
                      </div>

                      {product.isGasBottle ? (
                        <div className='mb-4 text-white'>
                          <span className='text-sm font-bold'>Bouteille+GPL : </span>
                          <span className='text-lg font-bold'>
                            {product.fullPrice}
                          </span>
                          <br />
                          <span className='text-sm font-bold'>Gaz : </span>
                          <span className='text-md font-bold'>
                            {product.emptyPrice}
                          </span>
                        </div>
                      ) : (
                        <span className='text-lg font-bold text-white mb-4'>
                          {product.price}
                        </span>
                      )}
                    </div>

                    <button className='bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition-all duration-300 mt-4'>
                      Voir plus
                    </button>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>

          {/* ✅ Pagination */}
          <div className='flex justify-center mt-12 space-x-2 z-40'>
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentIndex ? 'bg-red-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* ✅ Flèches navigation */}
          <button
            onClick={prevSlide}
            className='absolute left-5 bg-white shadow-xl p-4 rounded-full hover:scale-110 transition-all z-50'
          >
            <ChevronLeft className='w-7 h-7 text-gray-700' />
          </button>
          <button
            onClick={nextSlide}
            className='absolute right-5 bg-white shadow-xl p-4 rounded-full hover:scale-110 transition-all z-50'
          >
            <ChevronRight className='w-7 h-7 text-gray-700' />
          </button>
        </div>
      </div>
    </section>
  )
}

export default ProductCarousel
