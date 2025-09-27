// frontend/src/pages/CartPage.jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useTranslation } from 'react-i18next'

// images import (assure-toi des chemins)
import btn6 from '../../assets/images/btn6.png'
import btn125 from '../../assets/images/btn12.5.png'
import btn50 from '../../assets/images/btn50.png'
import vitrer from '../../assets/images/vitrer.png'
import classic from '../../assets/images/classic.png'
import detenteur from '../../assets/images/detenteur.png'
import detenteur2 from '../../assets/images/detenteur2.png'
import tuyo from '../../assets/images/tuyo.png'
import bruleur from '../../assets/images/bruleur.png'

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

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || 'https://pleingaz-site-web.onrender.com'

function formatPhoneCameroon(raw) {
  if (!raw) return raw
  let s = String(raw)
    .replace(/[^0-9+]/g, '')
    .trim()
  if (s.startsWith('0')) s = s.slice(1)
  if (s.startsWith('237') && !s.startsWith('+')) s = `+${s}`
  if (!s.startsWith('+237')) {
    if (s.startsWith('+')) {
      // keep
    } else {
      s = `+237${s}`
    }
  }
  s = s.replace(/^\+\+/, '+')
  return s
}

const CartPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { cart, handleUpdateCart, emptyCart } = useCart()

  // client states
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryDetails, setDeliveryDetails] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash') // cash | orange-money | mtn-momo | card

  // products from backend (assume API /api/products)
  const [allProducts, setAllProducts] = useState([])
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/products`)
        if (!res.ok) throw new Error('Erreur chargement produits')
        const data = await res.json()
        setAllProducts(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchProducts()
  }, [])

  const getPriceValue = (price) => {
    if (typeof price === 'string')
      return parseFloat(price.replace(/[^\d]/g, '')) || 0
    if (typeof price === 'number') return price
    return 0
  }

  const cartItems = Object.keys(cart || {})
    .map((cartId) => {
      const parts = cartId.split('-')
      const productId = parts[0]
      const priceType = parts[1]
      const product = allProducts.find((p) => p.id === productId)
      if (!product) return null
      let itemPrice = 0
      if (product.isGasBottle) {
        if (priceType === 'full') itemPrice = getPriceValue(product.fullPrice)
        else if (priceType === 'empty')
          itemPrice = getPriceValue(product.emptyPrice)
        else itemPrice = getPriceValue(product.price)
      } else {
        itemPrice = getPriceValue(product.price)
      }
      return {
        ...product,
        id: cartId,
        quantity: cart[cartId].quantity,
        price: itemPrice,
        name: product.name,
      }
    })
    .filter((it) => it)

  const calculateTotal = () =>
    cartItems.reduce((s, it) => s + it.price * it.quantity, 0)

  const handleRemoveItem = (id) => handleUpdateCart(id, -cart[id].quantity)

  // payment status UI
  const [paymentStatus, setPaymentStatus] = useState({
    state: 'idle',
    message: '',
  })

  // polling helper (returns final status string)
  const pollPayment = (reference, timeoutMs = 300000, intervalMs = 5000) => {
    return new Promise((resolve) => {
      const start = Date.now()
      const tick = async () => {
        try {
          const resp = await fetch(
            `${BACKEND_URL}/api/payments/verify/${reference}`
          )
          const data = await resp.json()
          const s = data.status
          if (s === 'complete') return resolve('complete')
          if (s === 'failed' || s === 'canceled') return resolve('failed')
          if (Date.now() - start > timeoutMs) return resolve('timeout')
          // still pending -> wait
          setTimeout(tick, intervalMs)
        } catch (err) {
          console.error('Polling error', err)
          return resolve('error')
        }
      }
      tick()
    })
  }

  const handleValidateOrder = async () => {
    try {
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

      // build order payload
      const itemsPayload = cartItems.map((it) => ({
        productId: it.id.split('-')[0],
        quantity: it.quantity,
        unitPrice: it.price,
      }))
      const total = calculateTotal()

      // CASH -> create order directly, no payment provider
      if (paymentMethod === 'cash') {
        const orderRes = await fetch(`${BACKEND_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName,
            customerEmail,
            customerPhone,
            deliveryAddress,
            paymentMethod: 'cash',
            items: itemsPayload,
            totalAmount: total,
          }),
        })
        if (!orderRes.ok) throw new Error('Erreur création commande')
        const orderData = await orderRes.json()
        emptyCart()
        navigate('/order-confirmation', {
          state: {
            orderDetails: {
              orderNumber: `PGZ-${orderData.id}`,
              totalAmount: total,
              deliveryDate,
              deliveryAddress,
              paymentMethod: 'Paiement à la livraison',
              items: cartItems,
            },
          },
        })
        return
      }

      // OTHERWISE -> online payment through backend endpoint that creates order + transaction
      setPaymentStatus({
        state: 'processing',
        message: t('Initialisation du paiement...'),
      })

      // format phone
      const formattedPhone = formatPhoneCameroon(customerPhone)

      const initResp = await fetch(`${BACKEND_URL}/api/payments/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone: formattedPhone,
          deliveryAddress,
          paymentMethod:
            paymentMethod === 'mtn-momo'
              ? 'momo.mtn'
              : paymentMethod === 'orange-money'
              ? 'momo.orange'
              : 'card',
          items: itemsPayload,
          totalAmount: total,
        }),
      })

      const initData = await initResp.json()
      if (!initResp.ok || !initData.success) {
        throw new Error(
          initData.error ||
            initData.message ||
            'Impossible d initialiser le paiement'
        )
      }

      const reference = initData.reference
      // if card -> authorization_url present
      if (initData.authorization_url) {
        setPaymentStatus({
          state: 'redirect',
          message: t('Redirection vers la page de paiement...'),
        })
        // empty cart before redirect
        emptyCart()
        window.location.href = initData.authorization_url
        return
      }

      // For mobile money USSD push -> start polling
      setPaymentStatus({
        state: 'pending',
        message: t('Confirmation envoyée. Confirmez sur votre téléphone.'),
      })

      const final = await pollPayment(reference)
      if (final === 'complete') {
        setPaymentStatus({
          state: 'success',
          message: t('Paiement confirmé. Redirection...'),
        })
        emptyCart()
        navigate('/order-confirmation', {
          state: {
            orderDetails: {
              orderNumber: `PGZ-${initData.orderId || 'N/A'}`,
              totalAmount: total,
              deliveryDate,
              deliveryAddress,
              paymentMethod,
              items: cartItems,
            },
          },
        })
      } else if (final === 'timeout') {
        setPaymentStatus({
          state: 'error',
          message: t('Délai dépassé. Paiement non confirmé.'),
        })
      } else {
        setPaymentStatus({
          state: 'error',
          message: t('Paiement échoué ou annulé.'),
        })
      }
    } catch (err) {
      console.error('Erreur commande/paiement:', err)
      setPaymentStatus({
        state: 'error',
        message: err.message || 'Erreur paiement',
      })
    }
  }

  const getTomorrowDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  }

  const isDisabled =
    cartItems.length === 0 ||
    paymentStatus.state === 'processing' ||
    paymentStatus.state === 'pending' ||
    paymentStatus.state === 'redirect'

  return (
    <motion.div
      className='bg-gray-50 min-h-screen pt-24 pb-16'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between mb-8'>
          <h1 className='text-4xl font-extrabold text-gray-800'>
            Votre Panier
          </h1>
          <motion.button
            onClick={() => navigate('/products')}
            className='flex items-center text-red-600 font-semibold hover:text-red-700'
            whileHover={{ x: -5 }}
          >
            <ArrowLeft size={20} className='mr-2' /> Continuer mes achats
          </motion.button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 bg-white rounded-2xl shadow-xl p-8'>
            <h2 className='text-2xl font-bold mb-6 border-b pb-4'>
              Récapitulatif de votre commande
            </h2>
            <div className='space-y-6'>
              {cartItems.length ? (
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
                  Votre panier est vide.
                </p>
              )}
            </div>
          </div>

          <div className='bg-white rounded-2xl shadow-xl p-8'>
            <h2 className='text-2xl font-bold mb-6 border-b pb-4'>
              Informations client et livraison
            </h2>
            <div className='space-y-3'>
              <input
                type='text'
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder='Votre nom complet'
                className='w-full p-2 border rounded-md'
              />
              <input
                type='email'
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder='Votre email'
                className='w-full p-2 border rounded-md'
              />
              <input
                type='tel'
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder='Votre numéro de téléphone'
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
                placeholder='Adresse de livraison'
                className='w-full p-2 border rounded-md'
              />
              <textarea
                value={deliveryDetails}
                onChange={(e) => setDeliveryDetails(e.target.value)}
                placeholder='Détails supplémentaires (optionnel)'
                rows={3}
                className='w-full p-2 border rounded-md'
              />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className='w-full p-2 border rounded-md'
              >
                <option value='cash'>💵 Paiement à la livraison</option>
                <option value='orange-money'>📱 Orange Money</option>
                <option value='mtn-momo'>📱 MTN Mobile Money</option>
                <option value='card'>💳 Carte bancaire</option>
              </select>
            </div>

            {paymentStatus.state !== 'idle' && (
              <div
                className={`mt-4 p-3 rounded-lg font-medium ${
                  paymentStatus.state === 'pending' ||
                  paymentStatus.state === 'processing'
                    ? 'bg-yellow-100 text-yellow-700'
                    : paymentStatus.state === 'success'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {paymentStatus.message}
              </div>
            )}

            <div className='mt-6'>
              <h3 className='text-2xl font-bold'>Total de la commande</h3>
              <p className='text-4xl font-extrabold text-red-600'>
                {calculateTotal().toLocaleString('fr-CM')} Fcfa
              </p>

              <motion.button
                onClick={handleValidateOrder}
                disabled={isDisabled}
                className={`w-full mt-6 py-3 rounded-full font-bold ${
                  isDisabled
                    ? 'bg-gray-400'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {paymentStatus.state === 'processing' ? (
                  <>
                    <span className='inline-block mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />{' '}
                    Initialisation...
                  </>
                ) : paymentStatus.state === 'pending' ? (
                  'En attente de confirmation...'
                ) : (
                  'Valider la commande'
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CartPage
