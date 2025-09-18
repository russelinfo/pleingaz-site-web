// src/components/CartPage.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import products from '../../data/products'
import { useTranslation } from 'react-i18next'

const CartPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { cart, handleUpdateCart, emptyCart } = useCart()
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryDetails, setDeliveryDetails] = useState('')
  const [paymentMethod, setPaymentMethod] = useState(
    t('Paiement à la livraison')
  )

  // Helper function to get the actual price value
  const getPriceValue = (price) => {
    if (typeof price === 'string') {
      return parseFloat(price.replace(/[^\d]/g, '')) || 0
    }
    if (typeof price === 'number') {
      return price
    }
    return 0 // Default to 0 if price is undefined or null
  }

  const cartItems = Object.keys(cart || {})
    .map((cartId) => {
      const parts = cartId.split('-')
      const productId = parts[0]
      const priceType = parts[1] // 'full' or 'empty' if it's a gas bottle

      const product = products.find((p) => p.id === productId)

      if (!product) {
        return null // Product not found
      }

      let itemPrice = 0
      let itemName = product.name

      if (product.isGasBottle) {
        if (priceType === 'full') {
          itemPrice = getPriceValue(product.fullPrice)
          itemName = `${t(product.name)} (${t('avec GPL')})`
        } else if (priceType === 'empty') {
          itemPrice = getPriceValue(product.emptyPrice)
          itemName = `${t(product.name)} (${t('Gaz seul')})`
        } else {
          // This case should ideally not happen if cartIds are formed correctly
          itemPrice = getPriceValue(product.price) // Fallback to base price if no type
          itemName = `${t(product.name)} (${t('Inconnu')})`
        }
      } else {
        itemPrice = getPriceValue(product.price)
        itemName = t(product.name)
      }

      // Ensure itemPrice is correctly determined and not NaN
      if (isNaN(itemPrice)) {
        console.error(
          `Invalid price for product ${productId} with type ${priceType}`
        )
        itemPrice = 0 // Prevent NaN propagation
      }

      return {
        ...product, // Spread original product data
        id: cartId, // Use the unique cartId for cart operations
        quantity: cart[cartId].quantity,
        price: itemPrice, // Store the determined numeric price for this cart item
        name: itemName, // Use the descriptive name
      }
    })
    .filter((item) => item !== null) // Filter out any null entries (e.g., if a product was deleted from data)

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  }

  const handleRemoveItem = (id) => {
    // To remove an item, we effectively set its quantity to 0
    handleUpdateCart(id, -cart[id].quantity)
  }

  const handleValidateOrder = () => {
    if (cartItems.length === 0) {
      alert(
        t(
          'Votre panier est vide. Veuillez ajouter des articles pour commander.'
        )
      )
      return
    }

    if (!deliveryDate || !deliveryAddress) {
      alert(t("Veuillez remplir la date et l'adresse de livraison."))
      return
    }

    const orderDetails = {
      orderNumber: 'PGZ-' + Date.now().toString().slice(-6), // Génère un numéro de commande simple
      items: cartItems, // Renommé 'cartItems' en 'items'
      deliveryDate,
      deliveryAddress,
      deliveryDetails,
      paymentMethod,
      totalAmount: calculateTotal(), // Renommé 'total' en 'totalAmount'
    }

    emptyCart()
    navigate('/order-confirmation', { state: { orderDetails } })
  }

  const getTomorrowDate = () => {
    const today = new Date()
    today.setDate(today.getDate() + 1)
    return today.toISOString().split('T')[0]
  }

  return (
    <motion.div
      className='bg-gray-50 min-h-screen pt-24 pb-16'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between mb-8'>
          <h1 className='text-4xl font-extrabold text-gray-800'>
            {t('Votre Panier')}
          </h1>
          <motion.button
            onClick={() => navigate('/products')} // Changed to navigate to /products instead of -1
            className='flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors'
            whileHover={{ x: -5 }}
          >
            <ArrowLeft size={20} className='mr-2' />
            {t('Continuer mes achats')}
          </motion.button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 bg-white rounded-2xl shadow-xl p-8'>
            <h2 className='text-2xl font-bold text-gray-800 mb-6 border-b pb-4'>
              {t('Récapitulatif de votre commande')}
            </h2>
            <div className='space-y-6'>
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className='flex items-center border-b border-gray-100 pb-4'
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className='w-20 h-20 object-contain rounded-lg mr-4'
                    />
                    <div className='flex-1'>
                      <h3 className='font-semibold text-lg text-gray-800'>
                        {item.name}
                      </h3>
                      <p className='text-sm text-gray-600'>
                        {item.quantity} x {item.price.toLocaleString('fr-CM')}{' '}
                        {t('Fcfa')}
                      </p>
                    </div>
                    <div className='text-right flex flex-col items-end'>
                      <p className='text-xl font-bold text-red-600'>
                        {(item.price * item.quantity).toLocaleString('fr-CM')}{' '}
                        {t('Fcfa')}
                      </p>
                      <div className='flex items-center space-x-2 mt-2'>
                        <button
                          onClick={() => handleUpdateCart(item.id, -1)}
                          className='bg-gray-200 text-gray-700 p-1 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50'
                          disabled={item.quantity <= 1} // Only disable if quantity is 1
                        >
                          <Minus size={16} />
                        </button>
                        <span className='font-bold'>{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateCart(item.id, 1)}
                          className='bg-gray-200 text-gray-700 p-1 rounded-full hover:bg-gray-300 transition-colors'
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className='text-red-500 hover:text-red-700 transition-colors mt-2'
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className='text-center text-gray-500 text-lg'>
                  {t('Votre panier est vide.')}
                </p>
              )}
            </div>
          </div>

          <div className='bg-white rounded-2xl shadow-xl p-8'>
            <h2 className='text-2xl font-bold text-gray-800 mb-6 border-b pb-4'>
              {t('Informations de livraison')}
            </h2>
            <div className='space-y-6'>
              <div>
                <label
                  htmlFor='deliveryDate'
                  className='block text-sm font-medium text-gray-700'
                >
                  {t('Date de livraison')}
                </label>
                <input
                  type='date'
                  id='deliveryDate'
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={getTomorrowDate()}
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500'
                  required
                />
              </div>
              <div>
                <label
                  htmlFor='deliveryAddress'
                  className='block text-sm font-medium text-gray-700'
                >
                  {t('Votre adresse')}
                </label>
                <input
                  type='text'
                  id='deliveryAddress'
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={t('Ex: Rue 5, Quartier des Fleurs')}
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500'
                  required
                />
              </div>
              <div>
                <label
                  htmlFor='deliveryDetails'
                  className='block text-sm font-medium text-gray-700'
                >
                  {t('Détails (à côté de…)')}
                </label>
                <textarea
                  id='deliveryDetails'
                  value={deliveryDetails}
                  onChange={(e) => setDeliveryDetails(e.target.value)}
                  placeholder={t(
                    'Ex: Maison à côté de la pharmacie du carrefour'
                  )}
                  rows='3'
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500'
                />
              </div>
              <div>
                <h3 className='text-xl font-bold text-gray-800 mb-2'>
                  {t('Mode de paiement')}
                </h3>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className='block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500'
                >
                  <option value='Paiement à la livraison'>
                    {t('Paiement à la livraison')}
                  </option>
                  <option value='Mobile Money (MTN/Orange)'>
                    {t('Mobile Money (MTN/Orange)')}
                  </option>
                </select>
              </div>
            </div>

            <div className='mt-8'>
              <h3 className='text-2xl font-bold text-gray-800'>
                {t('Total de la commande')}
              </h3>
              <p className='text-4xl font-extrabold text-red-600 mt-2'>
                {calculateTotal().toLocaleString('fr-CM')} {t('Fcfa')}
              </p>
              <motion.button
                onClick={handleValidateOrder}
                className='w-full mt-6 bg-red-600 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:bg-red-700 transition-colors disabled:opacity-50'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={cartItems.length === 0}
              >
                {t('Valider la commande')}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CartPage
