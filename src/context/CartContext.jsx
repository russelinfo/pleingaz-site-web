// src/context/CartContext.js
import React, { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export const useCart = () => {
  return useContext(CartContext)
}

export const CartProvider = ({ children }) => {
  // L'état initial du panier est un objet vide
  const [cart, setCart] = useState({})

  // Fonction pour ajouter ou retirer un produit du panier
  const handleUpdateCart = (productId, change) => {
    setCart((prevCart) => {
      // On crée une copie pour ne pas modifier l'état directement
      const newCart = { ...prevCart }
      const newQuantity = (newCart[productId] || 0) + change

      if (newQuantity > 0) {
        newCart[productId] = newQuantity
      } else {
        // Si la quantité est 0 ou moins, on supprime l'article du panier
        delete newCart[productId]
      }
      return newCart
    })
  }

  // Fonction pour vider complètement le panier
  const emptyCart = () => {
    setCart({})
  }

  // Calcul du nombre total d'articles dans le panier pour l'icône
  const totalItemsInCart = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{ cart, handleUpdateCart, totalItemsInCart, emptyCart }}
    >
      {children}
    </CartContext.Provider>
  )
}
