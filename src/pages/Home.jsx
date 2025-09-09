// src/pages/Home.jsx
import React from 'react'

// Importe les composants de section de la page d'accueil
import Header from '../components/Header'
import ProductCarousel from '../components/ProductCarousel'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import WhyChooseUs from '../components/WhyChooseUs'
import Testimonials from '../components/Testimonials'
import SocialSidebar from '../components/SocialSidebar'



// Le composant Home qui regroupe toutes les sections de la page d'accueil
const Home = () => {
  return (
    <>
      {/* <SocialSidebar />
      <Header /> */}
      <main>
        <HeroSection />
        <ProductCarousel />
        <WhyChooseUs />
        <Testimonials />
      </main>
      {/* <Footer /> */}
    </>
  )
}

export default Home
