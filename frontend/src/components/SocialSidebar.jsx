// src/components/SocialSidebar.jsx
import React from 'react'
import {
  FaTiktok,
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
        href='https://web.facebook.com/profile.php?id=100083413507172'
        target='_blank'
        rel='noopener noreferrer'
        className='bg-white p-3 rounded-full shadow-md hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center'
      >
        <FaFacebookF className='w-5 h-5 text-blue-600 hover:text-white' />
      </a>

      {/* Twitter */}
      {/* <a
        href='https://twitter.com'
        target='_blank'
        rel='noopener noreferrer'
        className='bg-white p-3 rounded-full shadow-md hover:bg-sky-500 hover:text-white transition-all duration-300 flex items-center justify-center'
      >
        <FaTwitter className='w-5 h-5 text-sky-500 hover:text-white' />
      </a> */}

      {/* Instagram */}
      <a
        href='https://www.instagram.com/infotechpleingaz?igsh=ODRjcmlsc2xvbGU2'
        target='_blank'
        rel='noopener noreferrer'
        className='bg-white p-3 rounded-full shadow-md hover:bg-pink-500 hover:text-white transition-all duration-300 flex items-center justify-center'
      >
        <FaInstagram className='w-5 h-5 text-pink-500 hover:text-white' />
      </a>

      {/* LinkedIn */}
      <a
        href='https://www.linkedin.com/in/infotech-gaz-1ab6881a9/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app'
        target='_blank'
        rel='noopener noreferrer'
        className='bg-white p-3 rounded-full shadow-md hover:bg-blue-800 hover:text-white transition-all duration-300 flex items-center justify-center'
      >
        <FaLinkedinIn className='w-5 h-5 text-blue-800 hover:text-white' />
      </a>
      <a
        href='https://www.tiktok.com/@infotech.pleingaz?_t=ZM-8zo0AvfP3S9&_r=1'
        target='_blank'
        rel='noopener noreferrer'
        className='bg-white p-3 rounded-full shadow-md hover:bg-blue-800 hover:text-white transition-all duration-300 flex items-center justify-center'
      >
        <FaTiktok className='w-5 h-5 text-blue-800 hover:text-white' />
      </a>
    </div>
  )
}

export default SocialSidebar
