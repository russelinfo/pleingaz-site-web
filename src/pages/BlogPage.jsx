// src/pages/BlogPage.jsx
import React from 'react'
import { motion } from 'framer-motion'
import blog1 from '../assets/images/secour.jpg'
import blog2 from '../assets/images/jeune.webp'
import blog3 from '../assets/images/equipement.jpg'
import blog4 from '../assets/images/secure.webp'

// Données statiques pour les articles de blog
const blogPosts = [
  {
    id: 1,
    title: "PleinGaz s'engage pour la sécurité : nos formations en secourisme",
    date: '10 Août 2024',
    summary:
      'La sécurité est notre priorité absolue. Découvrez comment nous formons notre personnel aux premiers secours pour garantir une intervention rapide et efficace.',
    image: blog1,
    link: '#',
  },
  {
    id: 2,
    title: "Opportunités pour les jeunes : Rejoignez l'aventure PleinGaz !",
    date: '15 Juillet 2024',
    summary:
      "Nous sommes fiers d'offrir des opportunités de formation et d'emploi aux jeunes talents. Découvrez comment vous pouvez construire votre avenir avec nous.",
    image: blog2,
    link: '#',
  },
  {
    id: 3,
    title: 'Comment choisir la bouteille de gaz idéale pour votre foyer ?',
    date: '28 Juin 2024',
    summary:
      "Avec toutes les options disponibles, il peut être difficile de s'y retrouver. Suivez nos conseils d'experts pour trouver la bouteille de gaz qui correspond à vos besoins.",
    image: blog3,
    link: '#',
  },
  {
    id: 4,
    title:
      'PleinGaz, votre partenaire de confiance : sécurité, rapidité et fiabilité',
    date: '05 Juin 2024',
    summary:
      'Découvrez notre engagement à fournir un service de livraison exceptionnel, avec un accent mis sur la sécurité de nos produits et la satisfaction de nos clients.',
    image: blog4,
    link: '#',
  },
]

// Animation de base pour les cartes
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: 'easeOut' },
  }),
}

const BlogPage = () => {
  return (
    <div className='bg-gray-50 py-16 px-6 md:px-12 min-h-screen'>
      {/* En-tête de la page */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className='text-left mb-12'
      >
        <p className='text-xl text-gray-700 font-semibold mb-2'>
          Le Blog PleinGaz
        </p>
        <h1 className='text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight'>
          Les histoires qui font <span className='text-red-600'>PleinGaz</span>
        </h1>
        <p className='mt-4 text-lg text-gray-600 max-w-3xl'>
          Découvrez nos dernières actualités, conseils pratiques et les
          initiatives qui font de PleinGaz votre partenaire de confiance.
        </p>
      </motion.div>

      {/* Grille des articles */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
        {blogPosts.map((post, i) => (
          <motion.div
            key={post.id}
            custom={i}
            initial='hidden'
            animate='visible'
            variants={cardVariants}
            className='bg-white rounded-xl shadow-md overflow-hidden transform transition-transform hover:scale-105'
          >
            <img
              src={post.image}
              alt={post.title}
              className='w-full h-56 object-cover'
            />
            <div className='p-6'>
              <p className='text-sm text-gray-500 mb-1'>{post.date}</p>
              <h2 className='text-xl font-bold text-gray-900 mb-2 leading-snug'>
                {post.title}
              </h2>
              <p className='text-gray-600 mb-4 text-sm'>{post.summary}</p>
              <a
                href={post.link}
                className='text-red-600 font-semibold text-base hover:underline transition-colors'
              >
                Lire l'article →
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bouton voir plus */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className='flex justify-center mt-12'
      >
        <button className='bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-red-700 transition-colors'>
          Voir plus d'articles
        </button>
      </motion.div>

      {/* Newsletter */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        className='mt-20 p-12 bg-gray-200 rounded-lg text-center'
      >
        <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-2'>
          Abonnez-vous à notre newsletter
        </h2>
        <p className='text-gray-600 mb-6'>
          Recevez nos dernières actualités et nos offres spéciales directement
          dans votre boîte de réception.
        </p>
        <div className='flex justify-center'>
          <input
            type='email'
            placeholder='Entrez votre email'
            className='w-full max-w-sm px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600'
          />
          <button className='bg-red-600 text-white font-bold py-3 px-6 rounded-r-lg hover:bg-red-700 transition-colors'>
            S'abonner
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default BlogPage
