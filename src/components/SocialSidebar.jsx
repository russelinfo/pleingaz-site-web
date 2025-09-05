// src/components/SocialSidebar.jsx
import React from 'react'
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from 'react-icons/fa'

const SocialSidebar = () => {
  return (
    <div className='fixed right-4 top-1/3 flex flex-col space-y-4 z-50'>
      {/* Facebook */}
      <a
        href='https://facebook.com'
        target='_blank'
        rel='noopener noreferrer'
        className='bg-white p-3 rounded-full shadow-md hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center'
      >
        <FaFacebookF className='w-5 h-5 text-blue-600 hover:text-white' />
      </a>

      {/* Twitter */}
      <a
        href='https://twitter.com'
        target='_blank'
        rel='noopener noreferrer'
        className='bg-white p-3 rounded-full shadow-md hover:bg-sky-500 hover:text-white transition-all duration-300 flex items-center justify-center'
      >
        <FaTwitter className='w-5 h-5 text-sky-500 hover:text-white' />
      </a>

      {/* Instagram */}
      <a
        href='https://instagram.com'
        target='_blank'
        rel='noopener noreferrer'
        className='bg-white p-3 rounded-full shadow-md hover:bg-pink-500 hover:text-white transition-all duration-300 flex items-center justify-center'
      >
        <FaInstagram className='w-5 h-5 text-pink-500 hover:text-white' />
      </a>

      {/* LinkedIn */}
      <a
        href='https://linkedin.com'
        target='_blank'
        rel='noopener noreferrer'
        className='bg-white p-3 rounded-full shadow-md hover:bg-blue-800 hover:text-white transition-all duration-300 flex items-center justify-center'
      >
        <FaLinkedinIn className='w-5 h-5 text-blue-800 hover:text-white' />
      </a>
    </div>
  )
}

export default SocialSidebar
