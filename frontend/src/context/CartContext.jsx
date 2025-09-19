// src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('pleingazCart')
    return savedCart ? JSON.parse(savedCart) : {}
  })

  useEffect(() => {
    localStorage.setItem('pleingazCart', JSON.stringify(cart))
  }, [cart])

  const getPriceValue = (price) => {
    if (typeof price === 'string') {
      return parseFloat(price.replace(/[^\d]/g, '')) || 0
    }
    if (typeof price === 'number') {
      return price
    }
    return 0 // Default to 0 if price is undefined or null
  }

  const addToCart = (product, priceType) => {
    const cartId = getCartId(product, priceType)
    const priceValue = getPriceValue(product.price)

    setCart((prevCart) => {
      const existingItem = prevCart[cartId]
      if (existingItem) {
        return {
          ...prevCart,
          [cartId]: {
            ...existingItem,
            quantity: existingItem.quantity + 1,
          },
        }
      } else {
        return {
          ...prevCart,
          [cartId]: {
            id: product.id, // Original product ID
            name: product.name,
            image: product.image,
            quantity: 1,
            price: priceValue, // Store the parsed numeric price
            priceType: priceType, // Store the type ('full', 'empty', or undefined)
            originalProductData: product, // Keep original data for reference if needed
          },
        }
      }
    })
  }

  const handleUpdateCart = (cartId, delta) => {
    setCart((prevCart) => {
      const item = prevCart[cartId]
      if (!item) return prevCart

      const newQuantity = item.quantity + delta

      if (newQuantity <= 0) {
        const newCart = { ...prevCart }
        delete newCart[cartId]
        return newCart
      } else {
        return {
          ...prevCart,
          [cartId]: { ...item, quantity: newQuantity },
        }
      }
    })
  }

  const emptyCart = () => {
    setCart({})
  }

  const totalItemsInCart = Object.values(cart).reduce(
    (total, item) => total + item.quantity,
    0
  )

  const getCartId = (product, priceType) => {
    if (product.isGasBottle) {
      // Ensure priceType is valid, otherwise default to a generic ID or handle error
      if (priceType === 'full') return product.id + '-full'
      if (priceType === 'empty') return product.id + '-empty'
      // If no priceType is provided but it's a gas bottle, this might indicate an issue.
      // However, for the context of adding a *new* item, we need a defined priceType.
      // For updating an existing item in cart, we rely on the cartId already stored.
      return product.id // Fallback, though ideally priceType should be defined.
    }
    return product.id // For non-gas bottles
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        handleUpdateCart,
        emptyCart,
        totalItemsInCart,
        getCartId, // Export getCartId if needed elsewhere
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
