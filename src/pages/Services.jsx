// src/pages/Services.jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Utensils, Wrench, Users, X } from 'lucide-react'

// Composants globaux
import Header from '../components/Header'
import Footer from '../components/Footer'
import SocialSidebar from '../components/SocialSidebar'

// Import des images
import livraisonImg from '../assets/images/livraison.png'
import proImg from '../assets/images/professionnels.jpg'
import installImg from '../assets/images/professionnels.jpg'
import distributeurImg from '../assets/images/distributeur.jpg'
import heroImg from '../assets/images/hero2.jpg'

const services = [
  {
    icon: <Home className='h-12 w-12 text-red-600' />,
    title: 'Livraison à Domicile',
    description:
      'Un service entièrement dédié à la livraison de gaz chez les particuliers. Commandez facilement et recevez votre bouteille en toute sécurité.',
    details: [
      'Livraison garantie en 24h maximum.',
      'Personnel qualifié pour vous aider à la réception.',
    ],
    image: livraisonImg,
  },
  {
    icon: <Utensils className='h-12 w-12 text-red-600' />,
    title: 'Livraison pour Professionnels',
    description:
      'Un service rapide et fiable pour les restaurants, hôtels, cafés et boulangeries.',
    details: [
      'Livraison express en 6h maximum.',
      'Cartes de fidélité pour des réductions.',
      'Accessoire gratuit après la 10e recharge.',
    ],
    image: proImg,
  },
  {
    icon: <Wrench className='h-12 w-12 text-red-600' />,
    title: 'Installation et Assistance',
    description:
      "Nos techniciens qualifiés assurent l'installation de votre bouteille et vous apportent des conseils pratiques.",
    details: [
      'Installation de la bouteille sur votre cuisinière.',
      'Expertise sur vos accessoires (tuyaux, régulateurs...).',
      'Conseils pour une utilisation en toute sécurité.',
    ],
    image: installImg,
  },
  {
    icon: <Users className='h-12 w-12 text-red-600' />,
    title: 'Assistance aux Distributeurs',
    description:
      'Nous soutenons les grossistes, les détaillants et les nouveaux investisseurs qui souhaitent distribuer notre marque.',
    details: [
      'Soutien dans les stratégies de distribution.',
      'Mise à disposition de nos emballages.',
      'Accompagnement pour investir dans la vente de gaz.',
    ],
    image: distributeurImg,
  },
]

// Animations pour la modale
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const modalVariants = {
  hidden: { y: '-100vh', opacity: 0 },
  visible: {
    y: '0',
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
  exit: { y: '100vh', opacity: 0 },
}

const Services = () => {
  const [selectedService, setSelectedService] = useState(null)

  return (
    <>
      
      <main className='bg-gray-50 py-20'>
        <div className='container mx-auto px-6'>
          {/* Section d'intro */}
          <div className='text-center mb-16'>
            <motion.h1
              className='text-5xl font-extrabold text-gray-900 mb-4'
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Nos Prestations de Service
            </motion.h1>
            <motion.p
              className='text-lg text-gray-600 max-w-2xl mx-auto'
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Découvrez la gamme complète de services que PLEINGAZ met à votre
              disposition, que vous soyez un particulier ou un professionnel.
            </motion.p>
          </div>

          {/* Cartes de services */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
            {services.map((service, index) => (
              <motion.div
                key={index}
                className='bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer'
                onClick={() => setSelectedService(service)}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className='w-full h-56 object-cover'
                />
                <div className='p-8'>
                  <div className='flex justify-center mb-4'>{service.icon}</div>
                  <h3 className='text-2xl font-bold text-gray-800 text-center mb-3'>
                    {service.title}
                  </h3>
                  <p className='text-gray-600 text-center mb-4'>
                    {service.description}
                  </p>
                  <ul className='list-disc list-inside text-gray-700 space-y-2'>
                    {service.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Section finale */}
          <div className='mt-20 text-center'>
            <motion.h3
              className='text-3xl font-bold text-gray-800 mb-6'
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Nous sommes là pour vous servir !
            </motion.h3>
            <motion.img
              src={heroImg}
              alt='Service Plein Gaz'
              className='w-full lg:h-[500px] object-cover rounded-xl shadow-2xl'
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </main>
      

      {/* Pop-up (Modale) */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50'
            variants={backdropVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              className='bg-white rounded-2xl p-8 max-w-lg w-full relative max-h-[90vh] overflow-y-auto'
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedService(null)}
                className='absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors'
              >
                <X size={28} />
              </button>
              <img
                src={selectedService.image}
                alt={selectedService.title}
                className='w-full h-64 object-cover rounded-xl mb-6'
              />
              <div className='text-center mb-4'>{selectedService.icon}</div>
              <h3 className='text-3xl font-bold text-gray-800 text-center mb-4'>
                {selectedService.title}
              </h3>
              <p className='text-gray-600 text-center mb-6'>
                {selectedService.description}
              </p>
              <ul className='list-disc list-inside text-gray-700 space-y-2'>
                {selectedService.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Services
