// frontend/src/pages/CartPage.jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useTranslation } from 'react-i18next'

// Import des images locales
import btn6 from '../../assets/images/btn6.png'
import btn125 from '../../assets/images/btn12.5.png'
import btn50 from '../../assets/images/btn50.png'
import vitrer from '../../assets/images/vitrer.png'
import classic from '../../assets/images/classic.png'
import detenteur from '../../assets/images/detenteur.png'
import detenteur2 from '../../assets/images/detenteur2.png'
import tuyo from '../../assets/images/tuyo.png'
import bruleur from '../../assets/images/bruleur.png'

// Carte fichier → image
const imageMap = {
  'btn6.png': btn6,
  'btn12.5.png': btn125,
  'btn50.png': btn50,
  'vitrer.png': vitrer,
  'classic.png': classic,
  'detenteur.png': detenteur,
  'detenteur2.png': detenteur2,
  'tuyo.png': tuyo,
  'bruleur.png': bruleur,
}

const CartPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { cart, handleUpdateCart, emptyCart } = useCart()

  // Infos client
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryDetails, setDeliveryDetails] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')

  // Charger produits depuis API
  const [allProducts, setAllProducts] = useState([])
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          'https://pleingaz-site-web.onrender.com/api/products'
        )
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`)
        const data = await response.json()
        setAllProducts(data)
      } catch (err) {
        console.error('Erreur chargement produits:', err)
      }
    }
    fetchProducts()
  }, [])

  const getPriceValue = (price) => {
    if (typeof price === 'string') {
      return parseFloat(price.replace(/[^\d]/g, '')) || 0
    }
    if (typeof price === 'number') return price
    return 0
  }

  // Construire items panier
  const cartItems = Object.keys(cart || {})
    .map((cartId) => {
      const [productId, priceType] = cartId.split('-')
      const product = allProducts.find((p) => p.id === productId)
      if (!product) return null

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
          itemPrice = getPriceValue(product.price)
        }
      } else {
        itemPrice = getPriceValue(product.price)
      }

      return {
        ...product,
        id: cartId,
        quantity: cart[cartId].quantity,
        price: itemPrice,
        name: itemName,
      }
    })
    .filter((item) => item !== null)

  const calculateTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

  const handleRemoveItem = (id) => {
    handleUpdateCart(id, -cart[id].quantity)
  }

  // ✅ Validation de la commande
  const handleValidateOrder = async () => {
    if (cartItems.length === 0) {
      alert(t('Votre panier est vide.'))
      return
    }
    if (!customerName || !customerEmail || !customerPhone) {
      alert(t('Veuillez remplir vos informations personnelles.'))
      return
    }
    if (!deliveryDate || !deliveryAddress) {
      alert(t("Veuillez remplir la date et l'adresse de livraison."))
      return
    }

    const orderPayload = {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryDate,
      paymentMethod,
      items: cartItems.map((item) => ({
        productId: item.id.split('-')[0],
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      totalAmount: calculateTotal(),
    }

    try {
      // Paiement à la livraison
      if (paymentMethod === 'cash') {
        const response = await fetch(
          'https://pleingaz-site-web.onrender.com/api/orders',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload),
          }
        )
        const data = await response.json()

        emptyCart()
        navigate('/order-confirmation', {
          state: { orderDetails: { ...orderPayload, orderId: data.id } },
        })
      } else {
        // Autres paiements (mobile / carte)
        const orderResponse = await fetch(
          'https://pleingaz-site-web.onrender.com/api/orders',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload),
          }
        )
        const orderData = await orderResponse.json()

        const paymentPayload = {
          amount: calculateTotal(),
          phone: customerPhone,
          email: customerEmail,
          orderId: orderData.id,
          paymentMethod, // orange-money / mtn-momo / card
        }

        const paymentResponse = await fetch(
          'https://pleingaz-site-web.onrender.com/api/payments/initialize',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentPayload),
          }
        )
        const paymentData = await paymentResponse.json()
        console.log('✅ Payment initialized:', paymentData)

        if (paymentData.authorization_url) {
          emptyCart()
          window.location.href = paymentData.authorization_url
        } else {
          alert(
            'Veuillez confirmer le paiement sur votre téléphone ou carte bancaire.'
          )
        }
      }
    } catch (err) {
      console.error('❌ Erreur commande/paiement:', err)
      alert(`Erreur: ${err.message}`)
    }
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
            onClick={() => navigate('/products')}
            className='flex items-center text-red-600 font-semibold hover:text-red-700'
            whileHover={{ x: -5 }}
          >
            <ArrowLeft size={20} className='mr-2' />
            {t('Continuer mes achats')}
          </motion.button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Liste panier */}
          <div className='lg:col-span-2 bg-white rounded-2xl shadow-xl p-8'>
            <h2 className='text-2xl font-bold mb-6 border-b pb-4'>
              {t('Récapitulatif de votre commande')}
            </h2>
            <div className='space-y-6'>
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className='flex items-center border-b pb-4'
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    <img
                      src={imageMap[item.image]}
                      alt={item.name}
                      className='w-20 h-20 object-contain rounded-lg mr-4'
                    />
                    <div className='flex-1'>
                      <h3 className='font-semibold text-lg'>{item.name}</h3>
                      <p className='text-sm text-gray-600'>
                        {item.quantity} x {item.price.toLocaleString('fr-CM')}{' '}
                        Fcfa
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-xl font-bold text-red-600'>
                        {(item.price * item.quantity).toLocaleString('fr-CM')}{' '}
                        Fcfa
                      </p>
                      <div className='flex items-center space-x-2 mt-2'>
                        <button
                          onClick={() => handleUpdateCart(item.id, -1)}
                          className='bg-gray-200 p-1 rounded-full'
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className='font-bold'>{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateCart(item.id, 1)}
                          className='bg-gray-200 p-1 rounded-full'
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className='text-red-500 hover:text-red-700 mt-2'
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className='text-center text-gray-500'>
                  {t('Votre panier est vide.')}
                </p>
              )}
            </div>
          </div>

          {/* Formulaire client */}
          <div className='bg-white rounded-2xl shadow-xl p-8'>
            <h2 className='text-2xl font-bold mb-6 border-b pb-4'>
              {t('Informations client et livraison')}
            </h2>
            <div className='space-y-4'>
              <input
                type='text'
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('Votre nom complet')}
                className='w-full p-2 border rounded-md'
              />
              <input
                type='email'
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder={t('Votre email')}
                className='w-full p-2 border rounded-md'
              />
              <input
                type='tel'
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder={t('Votre numéro de téléphone')}
                className='w-full p-2 border rounded-md'
              />
              <input
                type='date'
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={getTomorrowDate()}
                className='w-full p-2 border rounded-md'
              />
              <input
                type='text'
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder={t('Adresse de livraison')}
                className='w-full p-2 border rounded-md'
              />
              <textarea
                value={deliveryDetails}
                onChange={(e) => setDeliveryDetails(e.target.value)}
                placeholder={t('Détails supplémentaires (optionnel)')}
                className='w-full p-2 border rounded-md'
              />

              {/* Choix méthode paiement */}
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className='w-full p-2 border rounded-md'
              >
                <option value='cash'>💵 {t('Paiement à la livraison')}</option>
                <option value='orange-money'>📱 {t('Orange Money')}</option>
                <option value='mtn-momo'>📱 {t('MTN Mobile Money')}</option>
                <option value='card'>💳 {t('Carte Bancaire')}</option>
              </select>
            </div>

            <div className='mt-6'>
              <h3 className='text-2xl font-bold'>
                {t('Total de la commande')}
              </h3>
              <p className='text-4xl font-extrabold text-red-600'>
                {calculateTotal().toLocaleString('fr-CM')} Fcfa
              </p>
              <motion.button
                onClick={handleValidateOrder}
                className='w-full mt-6 bg-red-600 text-white font-bold py-3 px-6 rounded-full'
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
