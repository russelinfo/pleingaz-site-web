// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Importe le contexte du panier
import { CartProvider } from './context/CartContext'

// Importe tes pages existantes
import Home from './pages/Home'
import About from './pages/About'
import Header from './components/Header'
import Footer from './components/Footer'
import SocialSidebar from './components/SocialSidebar'

// Importe les pages de produits que nous avons créées
import Services from './pages/Services'
import ProductsPage from './pages/NosServices/ProductsPage'
import ProductDetail from './pages/NosServices/ProductDetail'
import CartPage from './pages/NosServices/CartPage'
import OrderConfirmationPage from './pages/NosServices/OrderConfirmationPage'
import { i } from 'framer-motion/client'
import Agences from './pages/Agences'
import FAQ from './pages/FAQ'
import Contact from './pages/Contact'
import BlogPage from './pages/BlogPage'
import ReviewForm from './pages/ReviewForm'
function App() {
  return (
    <Router>
      <CartProvider>
        {' '}
        {/* ✅ Le provider englobe toute l’application */}
        {/* <SocialSidebar /> */}
        <Header />
        <Routes>
          {/* Routes principales */}
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/services' element={<Services />} />
          <Route path='/agences' element={<Agences />} />

          {/* Routes du système de commande */}
          <Route path='/products' element={<ProductsPage />} />
          <Route path='/products/:id' element={<ProductDetail />} />
          <Route path='/cart' element={<CartPage />} />
          <Route path='/faq' element={<FAQ />} />
          <Route path='/blog' element={<BlogPage />} />
          <Route path='/review' element={<ReviewForm />} />
          <Route path='/contact' element={<Contact />} />
          <Route
            path='/order-confirmation'
            element={<OrderConfirmationPage />}
            
          />
        </Routes>
        <Footer />
      </CartProvider>
    </Router>
  )
}

export default App
