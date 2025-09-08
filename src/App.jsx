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

// Pages pour l'exemple
const AboutUs = () => (
  <div>
    <h1>Page "À propos de nous"</h1>
  </div>
)
const Produits = () => (
  <div>
    <h1>Page de nos produits</h1>
  </div>
)
const Services = () => (
  <div>
    <h1>Page "Prestation de service"</h1>
  </div>
)
const Contact = () => (
  <div>
    <h1>Page "Contactez Nous"</h1>
  </div>
)
const Blog = () => (
  <div>
    <h1>Page Blog</h1>
  </div>
)

function App() {
  return (
    <Router>
      <div className='App'>
        <Header />
        <Routes>
          <Route
            path='/'
            element={
              <>
                <SocialSidebar />
                <HeroSection />
                {/* <AboutSection /> */}
                <ProductCarousel />
                <WhyChooseUs />
                <Testimonials />
                <Footer />
              </>
            }
          />
          <Route path='/a-propos' element={<AboutUs />} />
          <Route path='/produits' element={<Produits />} />
          <Route path='/services' element={<Services />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/blog' element={<Blog />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
