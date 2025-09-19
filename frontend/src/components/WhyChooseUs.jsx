// src/components/WhyChooseUs.jsx
import React from 'react'
import { useTranslation } from 'react-i18next' // ✅ Ajout : Import du hook de traduction
import { Truck, ShieldCheck, Headset } from 'lucide-react'

const features = [
  {
    icon: <Truck className='w-12 h-12 text-red-600 mb-4' />,
    title: 'Livraison Rapide',
    description:
      "Recevez vos bouteilles de gaz directement à votre porte en un temps record, garantissant que vous ne manquez jamais d'énergie.",
  },
  {
    icon: <ShieldCheck className='w-12 h-12 text-red-600 mb-4' />,
    title: 'Sécurité Maximale',
    description:
      "Chacun de nos produits est testé et certifié pour répondre aux normes de sécurité les plus strictes, pour une tranquillité d'esprit totale.",
  },
  {
    icon: <Headset className='w-12 h-12 text-red-600 mb-4' />,
    title: 'Support Client 24/7',
    description:
      'Notre équipe est disponible à tout moment pour répondre à vos questions et résoudre vos problèmes, de jour comme de nuit.',
  },
]

const WhyChooseUs = () => {
  const { t } = useTranslation() // ✅ Ajout : Initialisation du hook

  return (
    <section className='relative py-20 bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100'>
      <div className='container mx-auto px-4'>
        {/* Titre */}
        <div className='text-left mb-16'>
          <div className='flex items-center justify-start mb-6'>
            <div className='w-96 h-1 bg-red-600 mr-4 rounded-full' />
            <h2 className='text-3xl md:text-4xl font-extrabold text-gray-800'>
              {t('Pourquoi nous choisir ?')}
            </h2>
          </div>
          <p className='text-gray-600 max-w-2xl text-lg'>
            {t(
              'Chez PLEINGAZ, nous vous offrons bien plus qu’un service de livraison : la rapidité, la sécurité et un accompagnement client irréprochable au quotidien.'
            )}
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-10'>
          {features.map((feature, index) => (
            <div
              key={index}
              className='bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center'
            >
              <div className='mb-4'>{feature.icon}</div>
              <h3 className='text-xl font-bold text-gray-800 mb-3'>
                {t(feature.title)}
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                {t(feature.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
