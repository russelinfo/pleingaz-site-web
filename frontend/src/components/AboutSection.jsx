import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Users, Leaf, TrendingUp } from 'lucide-react'
import aboutVideo from '../assets/videos/present.mp4'

const pillars = [
  {
    icon: <Heart className='w-8 h-8 text-red-600' />,
    title: 'Santé',
    desc: 'Réduire les maladies liées aux feux de bois en proposant une énergie propre.',
  },
  {
    icon: <Users className='w-8 h-8 text-red-600' />,
    title: 'Social',
    desc: 'Économiser le temps des familles, pour qu’elles se consacrent à l’essentiel.',
  },
  {
    icon: <TrendingUp className='w-8 h-8 text-red-600' />,
    title: 'Économie',
    desc: 'Un combustible moins cher et plus efficace que le bois ou le charbon.',
  },
  {
    icon: <Leaf className='w-8 h-8 text-red-600' />,
    title: 'Environnement',
    desc: 'Lutter contre la déforestation et le réchauffement climatique.',
  },
]

const programs = [
  'Soutien à l’acquisition du kit de démarrage pour les démunis',
  'Programme pour l’emploi de la Femme',
  'Programme pour l’emploi de la Jeunesse',
  'Formation sur la bonne gouvernance',
  'Accompagnement pour la certification ISO',
]

const AboutSection = () => {
  return (
    <section className='relative bg-gradient-to-b from-[#f3f4f6] via-[#e5e7eb] to-[#f3f4f6] py-20 overflow-hidden'>
      <div className='container mx-auto px-6'>
        {/* ✅ Titre principal */}
        <div className='flex items-center justify-start gap-4 mb-16'>
          <span className='h-[3px] w-96 bg-red-600 rounded-full'></span>
          <h2 className='text-3xl font-bold text-gray-800'>
            À propos de PLEINGAZ
          </h2>
          {/* <span className='h-[3px] w-16 bg-red-600 rounded-full'></span> */}
        </div>

        {/* ✅ Texte + vidéo côte à côte */}
        <div className='flex flex-col lg:flex-row items-start gap-16'>
          {/* Texte */}
                <motion.div
                className='lg:w-1/2'
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                >
                <h3 className='text-2xl font-semibold text-gray-800 mb-6'>
                  PLEINGAZ,{' '}
                  <span className='text-red-600'>Partenaire de confiance</span>
                </h3>
                <p className='text-gray-700 mb-4'>
                  PLEINGAZ est une marque commerciale camerounaise de gaz
                  domestique, distribuée par <b>INFOTECH S.A.</b> à travers son
                  département <b>INFOTECHGAZ</b>. Présente sur le marché depuis
                  décembre 2015, PLEINGAZ s’est imposée comme un acteur de référence
                  dans le secteur de l’énergie au Cameroun.
                </p>
                <p className='text-gray-700 mb-4'>
                  Nos produits sont disponibles sur tout le territoire national
                  grâce à un réseau de distribution solide et fiable. Notre mission
                  est de rendre le gaz domestique accessible au plus grand nombre,
                  en garantissant <b>sécurité</b>, <b>fiabilité</b> et{' '}
                  <b>disponibilité permanente</b>.
                </p>
                <p className='text-gray-700 mb-8'>
                  En plus du gaz, PLEINGAZ propose une gamme complète d’
                  <b>accessoires</b> : plaques à gaz, détendeurs, tuyaux, brûleurs, et autres
                  équipements essentiels pour une utilisation simple et sécurisée.
                </p>
                <p className='text-gray-700 mb-8'>
                  Le produit a reçu un accueil positif au Cameroun, les ventes au
                  lancement ont largement dépassé les prévisions. Depuis
                  l’introduction de PLEINGAZ, les ménages insatisfaits par d’autres
                  marques ont été satisfaits et continuent à faire confiance à notre
                  marque. Cela a été possible en raison de facteurs tels que la
                  fiabilité, la disponibilité et la sécurité de nos bouteilles.
                </p>
                </motion.div>

                {/* Vidéo */}
          <motion.div
            className='lg:w-1/2 relative rounded-2xl overflow-hidden shadow-2xl h-[350px] lg:h-auto flex'
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <video
              src={aboutVideo}
              autoPlay
              loop
              muted
              playsInline
              className='w-full h-full object-cover'
            />
            <div className='absolute inset-0 bg-black/20'></div>
          </motion.div>
        </div>

        {/* ✅ Engagements en dessous du texte + vidéo */}
        <motion.div
          className='mt-20'
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Titre stylisé */}
          <div className='flex items-center justify-center gap-3 mb-8'>
            <span className='h-[3px] w-12 bg-red-600 rounded-full'></span>
            <h3 className='text-2xl font-semibold text-gray-800'>
              Notre engagement
            </h3>
            <span className='h-[3px] w-12 bg-red-600 rounded-full'></span>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {pillars.map((p, i) => (
              <motion.div
                key={i}
                className='bg-white shadow-md rounded-xl p-5 flex flex-col items-start gap-3 hover:shadow-xl transition-all cursor-pointer text-center'
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className='flex justify-center w-full'>{p.icon}</div>
                <h4 className='font-semibold text-gray-800'>{p.title}</h4>
                <p className='text-sm text-gray-600'>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ✅ Programmes sociaux */}
        <motion.div
          className='mt-20'
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Titre stylisé */}
          <div className='flex items-center justify-center gap-3 mb-8'>
            <span className='h-[3px] w-12 bg-red-600 rounded-full'></span>
            <h3 className='text-2xl font-semibold text-gray-800'>
              Nos initiatives sociales
            </h3>
            <span className='h-[3px] w-12 bg-red-600 rounded-full'></span>
          </div>
          <ul className='grid md:grid-cols-2 gap-4 text-gray-700'>
            {programs.map((prog, i) => (
              <li
                key={i}
                className='bg-white rounded-lg shadow p-4 hover:shadow-md transition'
              >
                ✅ {prog}
              </li>
            ))}
          </ul>
        </motion.div>
        <div className='text-center mt-12'>
          <a
            href='/about'
            className='bg-red-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-700 transition-all'
          >
            En savoir plus
          </a>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
