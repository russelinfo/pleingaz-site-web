import React, { createContext, useState, useContext } from 'react'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({})

  const handleUpdateCart = (productId, change) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart }
      const newQuantity = (newCart[productId] || 0) + change
      if (newQuantity <= 0) {
        delete newCart[productId]
      } else {
        newCart[productId] = newQuantity
      }
      return newCart
    })
  }

  const totalItemsInCart = Object.values(cart).reduce(
    (sum, qty) => sum + qty,
    0
  )

  const handleRemoveItem = (id) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart }
      delete newCart[id]
      return newCart
    })
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        handleUpdateCart,
        totalItemsInCart,
        handleRemoveItem,
        setCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
