// src/components/Footer.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaTiktok } from 'react-icons/fa'
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import logo from '../assets/images/logo2.png'

const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className='relative text-white py-12 overflow-hidden'>
      {/* Dégradé animé en arrière-plan */}
      <div className='absolute inset-0 animate-gradient bg-[linear-gradient(270deg,#7f1d1d,#dc2626,#f87171,#ef4444,#991b1b)] bg-[length:400%_400%]' />

      <div className='relative container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 z-10'>
        {/* Colonne 1 - Logo + description */}
        <div className='flex flex-col space-y-3'>
          {/* ✅ Logo ajusté sans espace blanc */}
          <img src={logo} alt='Logo' className='w-60 h-auto pt-0 m-0 mb-6' />

          {/* ✅ Paragraphe rapproché */}
          <p className='text-base font-semibold text-gray-100 leading-relaxed m-0'>
            {t(
              'Votre partenaire de confiance pour la livraison rapide, sécurisée et fiable de bouteilles de gaz, directement chez vous.'
            )}
          </p>
        </div>

        {/* Colonne 2 - Navigation */}
        <div className='pt-5'>
          <h4 className='text-xl font-semibold mb-4'>
            {t('Navigation rapide')}
          </h4>
          <ul className='space-y-2'>
            <li>
              <a href='/a-propos' className='hover:text-gray-300 transition'>
                {t('À propos')}
              </a>
            </li>
            <li>
              <a href='/services' className='hover:text-gray-300 transition'>
                {t('Services')}
              </a>
            </li>
            <li>
              <a href='/contact' className='hover:text-gray-300 transition'>
                {t('Contact')}
              </a>
            </li>
            <li>
              <a href='/blog' className='hover:text-gray-300 transition'>
                {t('Blog')}
              </a>
            </li>
          </ul>
        </div>

        {/* Colonne 3 - Contact */}
        <div className='pt-5'>
          <h4 className='text-xl font-semibold mb-4'>{t('Contact')}</h4>
          <ul className='space-y-3'>
            <li className='flex items-center gap-2'>
              <Phone size={18} /> <span>+237 6 80 00 00 75</span>
            </li>
            <li className='flex items-center gap-2'>
              <Mail size={18} /> <span>support@pleingaz.com</span>
            </li>
            <li className='flex items-center gap-2'>
              <MapPin size={18} /> <span>{t('Yaoundé, Cameroun')}</span>
            </li>
          </ul>

          {/* Réseaux sociaux */}
          <div className='flex gap-4 mt-4'>
            <a href='#' className='hover:text-gray-300 transition'>
              <Facebook />
            </a>
            <a href='#' className='hover:text-gray-300 transition'>
              <Twitter />
            </a>
            <a href='#' className='hover:text-gray-300 transition'>
              <Instagram />
            </a>
            <a href='#' className='hover:text-gray-300 transition'>
              <Linkedin />
            </a>
            <a href='#' className='hover:text-gray-300 transition'>
              <FaTiktok size={22} />
            </a>
          </div>
        </div>
      </div>

      {/* Bas de page */}
      <div className='relative border-t border-white/20 mt-10 pt-6 text-center text-sm text-gray-200 z-10'>
        © {new Date().getFullYear()} {t('Plein Gaz. Tous droits réservés.')}
      </div>
    </footer>
  )
}

export default Footer
