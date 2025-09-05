// src/components/Testimonials.jsx
import React from 'react'
import { motion } from 'framer-motion'
import avatar2 from '../assets/images/boy1.jpg'
import avatar1 from '../assets/images/go.png'
import avatar3 from '../assets/images/mus.webp'

const testimonials = [
  {
    name: 'Marie D.',
    location: 'Douala',
    avatar: avatar1,
    quote:
      "Service client réactif, livraison ultra rapide et prix compétitifs. Plein Gaz a vraiment changé mon quotidien ! Je ne pourrais plus m'en passer.",
    rating: 5,
  },
  {
    name: 'Serge K.',
    location: 'Yaoundé',
    avatar: avatar2,
    quote:
      "La qualité des bouteilles et la sécurité sont irréprochables. C'est la raison principale pour laquelle je reste fidèle à Plein Gaz depuis des années.",
    rating: 5,
  },
  {
    name: 'Fatima B.',
    location: 'Bafoussam',
    avatar: avatar3,
    quote:
      "Des prix justes et un suivi excellent. C'est un plaisir de faire affaire avec une entreprise aussi professionnelle.",
    rating: 4,
  },
]

const renderStars = (rating) => {
  return [...Array(5)].map((_, i) => (
    <span
      key={i}
      className={`text-2xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
    >
      ★
    </span>
  ))
}

const Testimonials = () => {
  return (
    <section className='bg-white py-20 relative'>
      <div className='container mx-auto px-4'>
        {/* Titre de la section */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-extrabold text-gray-800 mb-4'>
            Ce que nos clients disent de nous
          </h2>
          <p className='text-gray-600 max-w-2xl mx-auto'>
            La satisfaction de nos clients est notre plus grande fierté. Voici
            leurs avis sincères sur nos services et nos produits.
          </p>
        </div>

        {/* Grille de témoignages */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className='bg-gray-50 rounded-2xl shadow-lg p-8 flex flex-col justify-between'
            >
              <div>
                <div className='flex items-center mb-4'>
                  {renderStars(testimonial.rating)}
                </div>
                <p className='text-gray-700 text-lg mb-6 leading-relaxed italic'>
                  "{testimonial.quote}"
                </p>
              </div>
              <div className='flex items-center'>
                <img
                  src={testimonial.avatar}
                  alt={`Avatar de ${testimonial.name}`}
                  className='w-14 h-14 rounded-full mr-4 object-cover'
                />
                <div>
                  <h4 className='font-bold text-gray-800'>
                    {testimonial.name}
                  </h4>
                  <p className='text-sm text-gray-500'>
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
