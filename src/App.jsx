// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header' // Importer le nouveau composant Header
import HeroSection from './components/HeroSection'
import ProductCarousel from './components/ProductCarousel'
import AboutSection from './components/AboutSection'
import WhyChooseUs from './components/WhyChooseUs'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import SocialSidebar from './components/SocialSidebar'
import './index.css'
import { div } from 'framer-motion/client'
import Home from  './pages/Home'
import About from  './pages/About'
import Services from  './pages/Services'


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/services' element={<Services />} />
      </Routes>
    </Router>
  )
}

export default App
