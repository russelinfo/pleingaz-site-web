// src/components/Header.jsx
import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import logo from '../assets/images/logo.png'
// Drapeaux (assure-toi que ces fichiers existent bien dans src/assets/images/)
import frFlag from '../assets/images/fr.jpg'
import enFlag from '../assets/images/en.jpg'
import cnFlag from '../assets/images/cn.jpg'

//declaration du tableau d'objet de tableau
  const languages = [
    { code: 'fr', label: 'Français', flag: frFlag },
    { code: 'en', label: 'English', flag: enFlag },
    { code: 'cn', label: '中文', flag: cnFlag },
  ]
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPointsDeVenteHovered, setIsPointsDeVenteHovered] = useState(false)
  const [selectedLang, setSelectedLang] = useState('fr')
  const location = useLocation()
  
  const getLinkClass = (path) => {
    return location.pathname === path
      ? 'font-semibold text-gray-800 border-b-2 border-red-600 pb-2 transition duration-300'
      : 'font-semibold text-gray-800 hover:text-red-600 hover:border-b-2 hover:border-red-600 pb-2 transition duration-300'
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className='bg-white px-4 md:px-12 py-5 shadow-md sticky top-0 z-50'>
      <div className='container mx-auto'>
        {/* --- LIGNE DU HAUT --- */}
        <div className='flex justify-between items-center mb-4'>
          {/* Liens Contact, FAQ, Mon Compte, Nos Points De Vente (Desktop) */}
          <div className='hidden md:flex items-center space-x-8'>
            <NavLink
              to='/contact'
              className='flex items-center text-gray-700 hover:border-b-2 hover:border-red-600 hover:text-red-600 transition duration-300 pb-2'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4 mr-1'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                />
              </svg>
              Contact
            </NavLink>
            <a
              href='#'
              className='flex items-center text-gray-700 hover:border-b-2 hover:border-red-600 hover:text-red-600 transition duration-300 pb-2'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4 mr-1'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8.228 9.255a6.527 6.527 0 018.573-2.484l2.5-1.5a1 1 0 011.3 1.3l-1.5 2.5a6.527 6.527 0 01-2.484 8.573 6.527 6.527 0 01-8.573-2.484l-2.5 1.5a1 1 0 01-1.3-1.3l1.5-2.5a6.527 6.527 0 012.484-8.573z'
                />
              </svg>
              FAQ
            </a>
            <NavLink
              to='/mon-compte'
              className='flex items-center text-gray-700 hover:border-b-2 hover:border-red-600 hover:text-red-600 transition duration-300 pb-2'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 mr-1'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
              Mon Compte
            </NavLink>
            <NavLink
              to='/points-de-vente'
              className='flex items-center text-gray-700 hover:border-b-2 hover:border-red-600 hover:text-red-600 transition duration-300 pb-2'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4 mr-1'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
              Nos Agences
            </NavLink>
          </div>
          <div className='flex items-center ml-auto space-x-4 hidden md:flex'>
            {/* Barre de recherche */}
            <div className='relative'>
              <input
                type='text'
                placeholder='Rechercher sur le site...'
                className='bg-gray-200 rounded-full py-2 px-4 pl-10 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition duration-300 border border-transparent'
              />
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
            {/* Sélecteur de langue */}
            <div className='relative'>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className='appearance-none bg-gray-200 border border-gray-300 text-gray-800 py-2 pl-10 pr-6 rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer'
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
                className='h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2'
              />
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>
          </div>
          {/* Sélecteur de langue (Mobile) */}
          <div className='flex items-center md:hidden mr-2'>
            <div className='relative'>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className='appearance-none bg-gray-200 border border-gray-300 text-gray-800 py-2 pl-10 pr-6 rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer'
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
                className='h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2'
              />
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>
          </div>
          {/* Menu Hamburger (Mobile) */}
          <div className='md:hidden flex items-center'>
            <button
              onClick={toggleMenu}
              className='text-gray-800 focus:outline-none ml-4'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16m-7 6h7'
                />
              </svg>
            </button>
          </div>
        </div>

        <hr className='my-4 border-gray-200 hidden md:block' />

        {/* --- LIGNE DU BAS (Desktop) --- */}
        <div className='flex justify-between items-center flex-wrap'>
          <div className='flex-shrink-0 mb-4 md:mb-0'>
            <img src={logo} alt='Logo de PLEINGAZ' className='h-14 w-auto' />
          </div>

          {/* Barre de recherche (Mobile) */}
          <div className='relative w-full md:hidden mb-4'>
            <input
              type='text'
              placeholder='Rechercher sur le site...'
              className='bg-gray-200 rounded-full py-2 px-4 pl-10 w-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition duration-300 border border-transparent'
            />
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>

          <div className='hidden md:flex items-center space-x-8'>
            <nav className='flex items-center space-x-8'>
              <NavLink to='/' className={getLinkClass('/')}>
                Accueil
              </NavLink>
              <NavLink to='/about' className={getLinkClass('/about')}>
                A propos de nous
              </NavLink>

              <NavLink to='/produits' className={getLinkClass('/produits')}>
               Nos produits
              </NavLink>

              <NavLink to='/services' className={getLinkClass('/services')}>
                Prestation de service
              </NavLink>
              <NavLink to='/contact' className={getLinkClass('/contact')}>
                Contactez Nous
              </NavLink>
              <div className='relative flex items-center'>
                <NavLink to='/blog' className={getLinkClass('/blog')}>
                  Blog
                </NavLink>
                <span className='absolute -top-1 left-1/2 transform -translate-x-1/2 -translate-y-full bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap'>
                  Actu!
                </span>
              </div>
            </nav>
            <button className='bg-red-600 text-white px-6 py-3 rounded-full flex items-center shadow-lg hover:bg-red-700 transition duration-300'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 mr-2'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
              Simuler mon coût
            </button>
          </div>
        </div>

        {/* --- Menu Overlay (Mobile) --- */}
        {isMenuOpen && (
          <div className='fixed inset-0 bg-white z-40 p-6 flex flex-col items-start md:hidden'>
            <button
              onClick={toggleMenu}
              className='self-end text-gray-800 mb-6'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
            <div className='flex flex-col space-y-6 w-full'>
              <NavLink
                to='/'
                className='text-2xl font-bold hover:text-red-600 flex items-center'
                onClick={toggleMenu}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1H9m2-2v2a1 1 0 001 1h2a1 1 0 001-1v-2m-6 0h6'
                  />
                </svg>
                Accueil
              </NavLink>
              <NavLink
                to='/a-propos'
                className='text-2xl font-bold hover:text-red-600 flex items-center'
                onClick={toggleMenu}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                A propos de nous
              </NavLink>
              <NavLink
                to='/services'
                className='text-2xl font-bold hover:text-red-600 flex items-center'
                onClick={toggleMenu}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
                  />
                </svg>
                Prestation de service
              </NavLink>
              <NavLink
                to='/contact'
                className='text-2xl font-bold hover:text-red-600 flex items-center'
                onClick={toggleMenu}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                  />
                </svg>
                Contactez Nous
              </NavLink>
              <a
                href='#'
                className='text-2xl font-bold hover:text-red-600 flex items-center'
                onClick={toggleMenu}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8.228 9.255a6.527 6.527 0 018.573-2.484l2.5-1.5a1 1 0 011.3 1.3l-1.5 2.5a6.527 6.527 0 01-2.484 8.573 6.527 6.527 0 01-8.573-2.484l-2.5 1.5a1 1 0 01-1.3-1.3l1.5-2.5a6.527 6.527 0 012.484-8.573z'
                  />
                </svg>
                FAQ
              </a>
              <NavLink
                to='/blog'
                className='text-2xl font-bold hover:text-red-600 relative flex items-center'
                onClick={toggleMenu}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v14M12 10l-2 2m0 0l2 2m-2-2h6m-2 2l-2-2m2 2l2 2'
                  />
                </svg>
                Blog
                <span className='ml-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full'>
                  Actu!
                </span>
              </NavLink>
              <NavLink
                to='/mon-compte'
                className='text-2xl font-bold hover:text-red-600 flex items-center'
                onClick={toggleMenu}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  />
                </svg>
                Mon Compte
              </NavLink>
              <div className='relative'>
                <a
                  href='#'
                  className='flex items-center text-2xl font-bold text-gray-800 hover:text-red-600'
                  onClick={() =>
                    setIsPointsDeVenteHovered(!isPointsDeVenteHovered)
                  }
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6 mr-2'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                  Nos Points De Vente
                </a>
                {isPointsDeVenteHovered && (
                  <div className='pl-4 mt-2 flex flex-col space-y-2'>
                    <a
                      href='#'
                      className='text-lg text-gray-700 hover:text-red-600'
                      onClick={toggleMenu}
                    >
                      Magsi
                    </a>
                    <a
                      href='#'
                      className='text-lg text-gray-700 hover:text-red-600'
                      onClick={toggleMenu}
                    >
                      Ngoa Ekele
                    </a>
                    <a
                      href='#'
                      className='text-lg text-gray-700 hover:text-red-600'
                      onClick={toggleMenu}
                    >
                      Dibamba
                    </a>
                    <a
                      href='#'
                      className='text-lg text-gray-700 hover:text-red-600'
                      onClick={toggleMenu}
                    >
                      Bafoussam
                    </a>
                    <a
                      href='#'
                      className='text-lg text-gray-700 hover:text-red-600'
                      onClick={toggleMenu}
                    >
                      Dschang
                    </a>
                    <a
                      href='#'
                      className='text-lg text-gray-700 hover:text-red-600'
                      onClick={toggleMenu}
                    >
                      Bertoua
                    </a>
                  </div>
                )}
              </div>
              <button
                className='bg-red-600 text-white px-6 py-3 mt-4 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700'
                onClick={toggleMenu}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 10V3L4 14h7v7l9-11h-7z'
                  />
                </svg>
                Simuler mon coût
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
