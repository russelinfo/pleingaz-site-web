// src/components/FAQSection.jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BsChevronDown } from 'react-icons/bs'
import { NavLink } from 'react-router-dom'

const faqsData = [
  {
    category: 'Général',
    questions: [
      {
        q: 'Comment puis-je passer une commande ?',
        a: [
          'Pour passer une commande, parcourez notre catalogue, ajoutez les produits à votre panier et suivez les étapes du processus de paiement. Vous recevrez une confirmation par email une fois la commande validée.',
        ],
      },
      {
        q: 'Quels moyens de paiement acceptez-vous ?',
        a: [
          ' Cartes bancaires (Visa, MasterCard).',
          ' Paiement mobile (Mobile Money, Orange Money).',
          ' Virement bancaire (sur demande).',
        ],
      },
      {
        q: 'Puis-je payer à la livraison ?',
        a: [' Oui, espèces ou Mobile Money à la réception de la commande.'],
      },
      {
        q: 'Quels sont vos délais de livraison ?',
        a: [
          ' Standard : 3 à 5 jours ouvrables.',
          ' Express : 24h à 48h selon votre localisation.',
        ],
      },
      {
        q: 'Comment suivre ma commande ?',
        a: [
          ' Vous recevez un SMS/Email de confirmation.',
          ' Nos livreurs vous contactent avant l’arrivée.',
        ],
      },
      {
        q: 'Quelle est la différence entre une bouteille consignée et une recharge ?',
        a: [
          ' Consignée = nouvelle bouteille pleine (inclut la consigne).',
          " Recharge = échange d'une bouteille vide contre une pleine (moins cher).",
        ],
      },
      {
        q: 'Quels accessoires propose PleinGaz ?',
        a: [
          ' Plaques de cuisson (acier, verre).',
          ' Détendeurs certifiés.',
          ' Tuyaux homologués.',
        ],
      },
      {
        q: 'Comment suivre ma commande ?',
        a: [
          ' Vous recevez un SMS/Email de confirmation.',
          ' Nos livreurs vous contactent avant l’arrivée.',
        ],
      },
      {
        q: 'Quels sont vos délais de livraison ?',
        a: [
          ' Standard : 3 à 5 jours ouvrables.',
          ' Express : 24h à 48h selon votre localisation.',
        ],
      },
      {
        q: 'Comment suivre ma commande ?',
        a: [
          ' Vous recevez un SMS/Email de confirmation.',
          ' Nos livreurs vous contactent avant l’arrivée.',
        ],
      },
      {
        q: 'Comment vérifier mon installation de gaz ?',
        a: [
          '✔️ Utiliser un détendeur adapté.',
          '✔️ Contrôler régulièrement le tuyau.',
          '✔️ Test avec de l’eau savonneuse (jamais avec une flamme).',
        ],
      },
      {
        q: 'Que faire en cas de fuite de gaz ?',
        a: [
          ' Ne pas allumer de flamme ni appareil électrique.',
          ' Fermez immédiatement la bouteille.',
          '📞 Appelez notre service d’assistance.',
        ],
      },
    ],
  },
  {
    category: 'Commandes & Paiement',
    questions: [
      {
        q: 'Quels moyens de paiement acceptez-vous ?',
        a: [
          ' Cartes bancaires (Visa, MasterCard).',
          ' Paiement mobile (Mobile Money, Orange Money).',
          ' Virement bancaire (sur demande).',
        ],
      },
      {
        q: 'Puis-je payer à la livraison ?',
        a: ['✅ Oui, espèces ou Mobile Money à la réception de la commande.'],
      },
      {
        q: 'Quels sont vos délais de livraison ?',
        a: [
          '🚚 Standard : 3 à 5 jours ouvrables.',
          '⚡ Express : 24h à 48h selon votre localisation.',
        ],
      },
      {
        q: 'Comment suivre ma commande ?',
        a: [
          '📩 Vous recevez un SMS/Email de confirmation.',
          '📍Nos livreurs vous contactent avant l’arrivée.',
        ],
      },
      {
        q: 'Quelle est la différence entre une bouteille consignée et une recharge ?',
        a: [
          '🟢 Consignée = nouvelle bouteille pleine (inclut la consigne).',
          "🔄 Recharge = échange d'une bouteille vide contre une pleine (moins cher).",
        ],
      },
      {
        q: 'Quels accessoires propose PleinGaz ?',
        a: [
          '🔥 Plaques de cuisson (acier, verre).',
          '🔧 Détendeurs certifiés.',
          '🧰 Tuyaux homologués.',
        ],
      },
    ],
  },
  {
    category: 'Livraison',
    questions: [
      {
        q: 'Quels sont vos délais de livraison ?',
        a: [
          '🚚 Standard : 3 à 5 jours ouvrables.',
          '⚡ Express : 24h à 48h selon votre localisation.',
        ],
      },
      {
        q: 'Comment suivre ma commande ?',
        a: [
          '📩 Vous recevez un SMS/Email de confirmation.',
          '📍 Nos livreurs vous contactent avant l’arrivée.',
        ],
      },
    ],
  },
  {
    category: 'Produits & Accessoires',
    questions: [
      {
        q: 'Quelle est la différence entre une bouteille consignée et une recharge ?',
        a: [
          '🟢 Consignée = nouvelle bouteille pleine (inclut la consigne).',
          "🔄 Recharge = échange d'une bouteille vide contre une pleine (moins cher).",
        ],
      },
      {
        q: 'Quels accessoires propose PleinGaz ?',
        a: [
          '🔥 Plaques de cuisson (acier, verre).',
          '🔧 Détendeurs certifiés.',
          '🧰 Tuyaux homologués.',
        ],
      },
    ],
  },
  {
    category: 'Sécurité',
    questions: [
      {
        q: 'Comment vérifier mon installation de gaz ?',
        a: [
          '✔️ Utiliser un détendeur adapté.',
          '✔️ Contrôler régulièrement le tuyau.',
          '✔️ Test avec de l’eau savonneuse (jamais avec une flamme).',
        ],
      },
      {
        q: 'Que faire en cas de fuite de gaz ?',
        a: [
          '❌ Ne pas allumer de flamme ni appareil électrique.',
          '✅ Fermez immédiatement la bouteille.',
          '📞 Appelez notre service d’assistance.',
        ],
      },
    ],
  },
]

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(faqsData[0].category)

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const filteredFaqs = faqsData.find((faq) => faq.category === selectedCategory)

  return (
    <section className='bg-gray-50 py-16 px-6 md:px-12 min-h-screen'>
      <div className='max-w-4xl mx-auto'>
        {/* Titre et description centraux */}
        <div className='text-center mb-10'>
          <h1 className='text-4xl md:text-5xl font-extrabold text-gray-900 mb-4'>
            Foire aux questions
          </h1>
          <p className='text-lg text-gray-600 max-w-xl mx-auto'>
            Voici les questions les plus fréquemment posées sur nos produits et
            services. Vous ne trouvez pas la réponse que vous cherchez ?
            <NavLink
              to='/contact'
              className='text-red-600 font-medium hover:underline ml-1'
            >
              Discutez avec notre équipe !
            </NavLink>
          </p>
        </div>

        {/* Boutons de catégories */}
        <div className='flex flex-wrap justify-center gap-2 mb-12'>
          {faqsData.map((faq, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(faq.category)}
              className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 
                ${
                  selectedCategory === faq.category
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {faq.category}
            </button>
          ))}
        </div>

        {/* Section des questions-réponses */}
        <div className='space-y-4'>
          {filteredFaqs &&
            filteredFaqs.questions.map((item, qIdx) => {
              const isOpen = openIndex === qIdx
              return (
                <div
                  key={qIdx}
                  className='bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden'
                >
                  <button
                    onClick={() => toggleQuestion(qIdx)}
                    className='w-full flex justify-between items-center px-6 py-5 text-left font-medium text-lg text-gray-900 hover:bg-gray-50 transition'
                  >
                    <span>{item.q}</span>
                    <BsChevronDown
                      className={`transform transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-red-600' : 'text-gray-400'
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className='px-6 pb-6 pt-2 text-gray-700 leading-relaxed'
                      >
                        <ul className='space-y-2'>
                          {item.a.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
        </div>
      </div>
    </section>
  )
}

export default FAQ
