// src/pages/FAQPage.jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BsChevronDown } from 'react-icons/bs'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import faqData from '../data/faqdata'

const FAQPage = () => {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(faqData[0].category)

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const filteredFaqs = faqData.find((faq) => faq.category === selectedCategory)

  return (
    <section className='bg-gray-50 py-16 px-6 md:px-12 min-h-screen'>
      <div className='max-w-4xl mx-auto'>
        {/* Titre et description centraux */}
        <div className='text-center mb-10'>
          <h1 className='text-4xl md:text-5xl font-extrabold text-gray-900 mb-4'>
            {t('Foire aux questions')}
          </h1>
          <p className='text-lg text-gray-600 max-w-xl mx-auto'>
            {t(
              'Voici les questions les plus fréquemment posées sur nos produits et services. Vous ne trouvez pas la réponse que vous cherchez ?'
            )}
            <NavLink
              to='/contact'
              className='text-red-600 font-medium hover:underline ml-1'
            >
              {t('Discutez avec notre équipe !')}
            </NavLink>
          </p>
        </div>

        {/* Boutons de catégories */}
        <div className='flex flex-wrap justify-center gap-2 mb-12'>
          {faqData.map((faq, index) => (
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
              {t(`faq.categories.${faq.category}`)}
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
                    <span>{t(item.qKey)}</span>
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
                          {item.aKeys.map((lineKey, i) => (
                            <li key={i}>{t(lineKey)}</li>
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

export default FAQPage
