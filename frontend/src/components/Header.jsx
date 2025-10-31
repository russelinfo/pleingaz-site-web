// src/components/Header.jsx
import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaHome,
  FaInfoCircle,
  FaBoxOpen,
  FaServicestack,
  FaPhoneAlt,
  FaQuestionCircle,
  FaBlog,
  FaUserCircle,
  FaMapMarkerAlt,
  FaCommentDots,
  FaSearch,
} from 'react-icons/fa'
import { useTranslation } from 'react-i18next' // ✅ Ajout : Import du hook de traduction
import logo from '../assets/images/logo.png'

// Drapeaux
import frFlag from '../assets/images/fr.jpg'
import enFlag from '../assets/images/en.jpg'

const languages = [
  { code: 'fr', label: 'Français', flag: frFlag },
  { code: 'en', label: 'English', flag: enFlag },
]

const Header = () => {
  const { t, i18n } = useTranslation() // ✅ Ajout : Initialisation du hook
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState('fr')
  const location = useLocation()

  const getLinkClass = (path) => {
    return location.pathname === path
      ? 'text-red-600 font-semibold flex items-center space-x-2 border-b-2 border-red-600 pb-1'
      : 'text-gray-800 hover:text-red-600 flex items-center space-x-2 hover:border-b-2 hover:border-red-600 pb-1'
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }
  // ✅ Assure que la langue reste mémorisée et s'applique instantanément

  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng') || 'fr'
    setSelectedLang(savedLang)
    i18n.changeLanguage(savedLang)
  }, [])

  // ✅ Ajout : Fonction pour gérer le changement de langue
  const handleLanguageChange = (e) => {
    const newLang = e.target.value
    setSelectedLang(newLang)

    // ✅ Change la langue immédiatement
    i18n.changeLanguage(newLang)

    // ✅ Sauvegarde la langue pour qu'elle soit retenue
    localStorage.setItem('i18nextLng', newLang)
  }

  return (
    <header className='bg-white shadow-md sticky top-0 z-50'>
      <div className='container mx-auto px-4 md:px-12'>
        {/* --- LIGNE DU HAUT --- */}
        <div className='flex justify-between items-center py-3 md:py-4 border-b border-gray-200'>
          {/* Liens utilitaires Desktop */}
          <div className='hidden md:flex items-center space-x-8 text-sm font-medium'>
            <NavLink
              to='/contact'
              className='flex items-center hover:text-red-600'
            >
              <FaPhoneAlt className='mr-1' /> {t('Contact')}
            </NavLink>
            <NavLink to='/faq' className='flex items-center hover:text-red-600'>
              <FaQuestionCircle className='mr-1' /> {t('FAQ')}
            </NavLink>
            <NavLink
              to='/mon-compte'
              className='flex items-center hover:text-red-600'
            >
              <FaUserCircle className='mr-1' /> {t('Mon compte')}
            </NavLink>
            <NavLink
              to='/agences'
              className='flex items-center hover:text-red-600'
            >
              <FaMapMarkerAlt className='mr-1' /> {t('agencies.title')}
            </NavLink>
          </div>

          {/* Recherche + Langue Desktop */}
          <div className='hidden md:flex items-center space-x-4'>
            <div className='relative'>
              <input
                type='text'
                placeholder={t('Rechercher...')}
                className='bg-gray-100 rounded-full py-2 pl-9 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 border border-gray-200'
              />
              <FaSearch className='h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
            </div>
            <div className='relative'>
              <select
                value={selectedLang}
                onChange={handleLanguageChange} // ✅ Modification : Utilisation de la nouvelle fonction
                className='appearance-none bg-gray-100 border border-gray-200 text-gray-800 py-2 pl-8 pr-6 rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer text-sm'
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <img
                src={languages.find((l) => l.code === selectedLang)?.flag}
                alt='flag'
                className='h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2'
              />
            </div>
          </div>

          {/* Mobile : langue à gauche + hamburger à droite */}
          <div className='flex items-center md:hidden w-full justify-between'>
            {/* Langue Mobile */}
            <div className='relative'>
              <select
                value={selectedLang}
                onChange={handleLanguageChange} // ✅ Modification : Utilisation de la nouvelle fonction
                className='bg-gray-100 border border-gray-200 text-gray-800 py-1.5 pl-7 pr-3 rounded-full text-sm'
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.code.toUpperCase()}
                  </option>
                ))}
              </select>
              <img
                src={languages.find((l) => l.code === selectedLang)?.flag}
                alt='flag'
                className='h-4 w-4 absolute left-1.5 top-1/2 transform -translate-y-1/2'
              />
            </div>

            {/* Hamburger tout à droite */}
            <button
              onClick={toggleMenu}
              className='relative w-9 h-9 flex flex-col justify-between items-center group'
            >
              <motion.span
                animate={
                  isMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }
                }
                className='block w-6 h-[2px] bg-gray-800 rounded group-hover:bg-red-600'
              />
              <motion.span
                animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className='block w-6 h-[2px] bg-gray-800 rounded group-hover:bg-red-600'
              />
              <motion.span
                animate={
                  isMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }
                }
                className='block w-6 h-[2px] bg-gray-800 rounded group-hover:bg-red-600'
              />
            </button>
          </div>
        </div>

        {/* --- LIGNE DU BAS --- */}
        <div className='flex flex-col md:flex-row md:justify-between md:items-center py-5'>
          {/* Logo */}
          <div className='flex-shrink-0 flex justify-center md:justify-start mb-3 md:mb-0'>
            <NavLink to='/'>
              <img src={logo} alt='Logo' className='h-16 w-auto' />
            </NavLink>
          </div>

          {/* Recherche Mobile visible */}
          <div className='relative w-full md:hidden mb-4 px-2'>
            <input
              type='text'
              placeholder={t('Rechercher...')}
              className='bg-gray-100 rounded-full py-2 pl-9 pr-4 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 border border-gray-200'
            />
            <FaSearch className='h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
          </div>

          {/* Navigation Desktop */}
          <nav className='hidden md:flex items-center space-x-8 text-lg font-medium'>
            <NavLink to='/' className={getLinkClass('/')}>
              <FaHome /> <span>{t('Accueil')}</span>
            </NavLink>
            <NavLink to='/about' className={getLinkClass('/about')}>
              <FaInfoCircle /> <span>{t('A propos')}</span>
            </NavLink>
            <NavLink to='/products' className={getLinkClass('/products')}>
              <FaBoxOpen /> <span>{t('Produits')}</span>
            </NavLink>
            <NavLink to='/services' className={getLinkClass('/services')}>
              <FaServicestack /> <span>{t('Services')}</span>
            </NavLink>
            <NavLink to='/contact' className={getLinkClass('/contact')}>
              <FaPhoneAlt /> <span>{t('Contact')}</span>
            </NavLink>
            <NavLink to='/faq' className={getLinkClass('/faq')}>
              <FaQuestionCircle /> <span>{t('FAQ')}</span>
            </NavLink>
            <NavLink to='/blog' className={getLinkClass('/blog')}>
              <FaBlog /> <span>{t('Blog')}</span>
            </NavLink>
          </nav>

          {/* Bouton avis */}
          <NavLink
            to='/review'
            className='hidden md:flex bg-red-600 text-white font-bold py-3 px-7 rounded-full shadow-md items-center hover:bg-red-700 transition'
          >
            <FaCommentDots className='mr-2' /> {t('Votre avis')}
          </NavLink>
        </div>
      </div>

      {/* --- Menu mobile --- */}
      {isMenuOpen && (
        <div className='fixed inset-0 z-40 md:hidden'>
          <div
            className='absolute inset-0 bg-black bg-opacity-40'
            onClick={toggleMenu}
          ></div>

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
            className='absolute top-0 right-0 w-3/4 max-w-sm h-full bg-white shadow-xl p-6 flex flex-col'
          >
            <nav className='flex flex-col divide-y divide-gray-200 text-lg font-medium text-gray-700'>
              <NavLink
                to='/'
                onClick={toggleMenu}
                className='py-4 flex items-center hover:text-red-600'
              >
                <FaHome className='mr-2' /> {t('Accueil')}
              </NavLink>
              <NavLink
                to='/about'
                onClick={toggleMenu}
                className='py-4 flex items-center hover:text-red-600'
              >
                <FaInfoCircle className='mr-2' /> {t('A propos')}
              </NavLink>
              <NavLink
                to='/products'
                onClick={toggleMenu}
                className='py-4 flex items-center hover:text-red-600'
              >
                <FaBoxOpen className='mr-2' /> {t('Produits')}
              </NavLink>
              <NavLink
                to='/services'
                onClick={toggleMenu}
                className='py-4 flex items-center hover:text-red-600'
              >
                <FaServicestack className='mr-2' /> {t('Services')}
              </NavLink>
              <NavLink
                to='/contact'
                onClick={toggleMenu}
                className='py-4 flex items-center hover:text-red-600'
              >
                <FaPhoneAlt className='mr-2' /> {t('Contact')}
              </NavLink>
              <NavLink
                to='/faq'
                onClick={toggleMenu}
                className='py-4 flex items-center hover:text-red-600'
              >
                <FaQuestionCircle className='mr-2' /> {t('FAQ')}
              </NavLink>
              <NavLink
                to='/blog'
                onClick={toggleMenu}
                className='py-4 flex items-center hover:text-red-600'
              >
                <FaBlog className='mr-2' /> {t('Blog')}
              </NavLink>
              <NavLink
                to='/mon-compte'
                onClick={toggleMenu}
                className='py-4 flex items-center hover:text-red-600'
              >
                <FaUserCircle className='mr-2' /> {t('Mon compte')}
              </NavLink>
              <NavLink
                to='/agences'
                onClick={toggleMenu}
                className='py-4 flex items-center hover:text-red-600'
              >
                <FaMapMarkerAlt className='mr-2' /> {t('Nos agences')}
              </NavLink>
            </nav>

            <div className='mt-auto pt-6'>
              <NavLink
                to='/review'
                onClick={toggleMenu}
                className='block w-full text-center bg-red-600 text-white font-bold py-3 rounded-full shadow-md flex items-center justify-center hover:bg-red-700 transition'
              >
                <FaCommentDots className='mr-2' /> {t('Laisser votre avis')}
              </NavLink>
            </div>
          </motion.div>
        </div>
      )}
    </header>
  )
}

export default Header
