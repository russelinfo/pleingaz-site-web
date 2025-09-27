import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useTranslation } from 'react-i18next'

// Import images
import btn6 from '../../assets/images/btn6.png'
import btn125 from '../../assets/images/btn12.5.png'
import btn50 from '../../assets/images/btn50.png'
import vitrer from '../../assets/images/vitrer.png'
import classic from '../../assets/images/classic.png'
import detenteur from '../../assets/images/detenteur.png'
import detenteur2 from '../../assets/images/detenteur2.png'
import tuyo from '../../assets/images/tuyo.png'
import bruleur from '../../assets/images/bruleur.png'

// Mapping
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

const BACKEND_URL = 'https://pleingaz-site-web.onrender.com'

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

  const [allProducts, setAllProducts] = useState([])
  const [paymentStatus, setPaymentStatus] = useState({
    state: 'idle',
    message: '',
  })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/products`)
        if (!res.ok) throw new Error('Erreur chargement produits')
        setAllProducts(await res.json())
      } catch (err) {
        console.error('Erreur produits:', err)
      }
    }
    fetchProducts()
  }, [])

  const getPriceValue = (p) =>
    typeof p === 'string' ? parseFloat(p.replace(/[^\d]/g, '')) || 0 : p || 0

  const cartItems = Object.keys(cart || {})
    .map((id) => {
      const [pid, type] = id.split('-')
      const product = allProducts.find((p) => p.id === pid)
      if (!product) return null
      let price = product.price || 0
      if (product.isGasBottle) {
        if (type === 'full') price = getPriceValue(product.fullPrice)
        else if (type === 'empty') price = getPriceValue(product.emptyPrice)
      }
      return {
        ...product,
        id,
        quantity: cart[id].quantity,
        price,
        name: product.name,
      }
    })
    .filter(Boolean)

  const calculateTotal = () =>
    cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const handleRemoveItem = (id) => handleUpdateCart(id, -cart[id].quantity)

  // Polling du paiement
  const pollPaymentStatus = (ref) =>
    new Promise((resolve) => {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/payments/verify/${ref}`)
          const data = await res.json()
          if (data.status === 'complete') {
            clearInterval(interval)
            resolve('complete')
          } else if (data.status === 'failed') {
            clearInterval(interval)
            resolve('failed')
          } else {
            setPaymentStatus({
              state: 'pending',
              message: 'Veuillez confirmer sur votre téléphone…',
            })
          }
        } catch (e) {
          clearInterval(interval)
          resolve('error')
        }
      }, 5000)
      setTimeout(() => {
        clearInterval(interval)
        resolve('timeout')
      }, 300000)
    })

  // Format phone
  const formatPhone = (phone) => {
    let f = phone.replace(/[^0-9+]/g, '')
    if (f.startsWith('0')) f = f.substring(1)
    if (!f.startsWith('+237')) f = f.startsWith('237') ? '+' + f : '+237' + f
    return f
  }

  const handleValidateOrder = async () => {
    if (cartItems.length === 0) return alert('Panier vide')
    if (!customerName || !customerEmail || !customerPhone)
      return alert('Infos manquantes')
    if (!deliveryDate || !deliveryAddress) return alert('Livraison manquante')

    const orderPayload = {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryDate,
      paymentMethod,
      items: cartItems.map((i) => ({
        productId: i.id.split('-')[0],
        quantity: i.quantity,
        unitPrice: i.price,
      })),
      totalAmount: calculateTotal(),
    }

    try {
      // 1. Création commande
      const orderRes = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })
      const orderData = await orderRes.json()
      const orderId = orderData.id

      // Cash → fin
      if (paymentMethod === 'cash') {
        emptyCart()
        return navigate('/order-confirmation', {
          state: {
            orderDetails: { ...orderPayload, orderId, paymentStatus: 'CASH' },
          },
        })
      }

      // 2. Mapping méthode NotchPay
      let notchMethod = ''
      if (paymentMethod === 'mtn-momo') notchMethod = 'momo.mtn'
      if (paymentMethod === 'orange-money') notchMethod = 'momo.orange'
      if (paymentMethod === 'card') notchMethod = 'card'

      // 3. Init paiement
      const paymentRes = await fetch(`${BACKEND_URL}/api/payments/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: calculateTotal(),
          phone: formatPhone(customerPhone),
          email: customerEmail,
          orderId,
          paymentMethod: notchMethod,
        }),
      })
      const paymentData = await paymentRes.json()
      if (!paymentRes.ok || !paymentData.reference)
        throw new Error(paymentData.message)

      const trxRef = paymentData.reference

      // Mobile Money
      if (notchMethod.includes('momo')) {
        setPaymentStatus({
          state: 'pending',
          message: 'Demande envoyée, confirmez sur votre téléphone…',
        })
        const result = await pollPaymentStatus(trxRef)
        if (result === 'complete') {
          emptyCart()
          navigate('/order-confirmation', {
            state: {
              orderDetails: {
                ...orderPayload,
                orderId,
                paymentStatus: 'COMPLETE',
              },
            },
          })
        } else {
          setPaymentStatus({
            state: 'error',
            message: 'Paiement échoué ou expiré.',
          })
        }
      }
      // Carte
      else if (paymentData.authorization_url) {
        emptyCart()
        window.location.href = paymentData.authorization_url
      }
    } catch (err) {
      console.error('Paiement erreur:', err)
      setPaymentStatus({ state: 'error', message: err.message })
    }
  }

  const getTomorrowDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  const isDisabled =
    cartItems.length === 0 ||
    ['loading', 'processing', 'pending', 'redirect'].includes(
      paymentStatus.state
    )

  return (
    <motion.div
      className='bg-gray-50 min-h-screen pt-24 pb-16'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between mb-8'>
          <h1 className='text-4xl font-extrabold text-gray-800'>
            {t('Votre Panier')}
          </h1>
          <motion.button
            onClick={() => navigate('/products')}
            className='flex items-center text-red-600 font-semibold'
            whileHover={{ x: -5 }}
          >
            <ArrowLeft size={20} className='mr-2' />
            {t('Continuer mes achats')}
          </motion.button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Panier */}
          <div className='lg:col-span-2 bg-white rounded-2xl shadow-xl p-8'>
            <h2 className='text-2xl font-bold mb-6 border-b pb-4'>
              {t('Récapitulatif')}
            </h2>
            {cartItems.length > 0 ? (
              cartItems.map((i) => (
                <motion.div
                  key={i.id}
                  className='flex items-center border-b pb-4 mb-4'
                >
                  <img
                    src={imageMap[i.image]}
                    alt={i.name}
                    className='w-20 h-20 object-contain rounded-lg mr-4'
                  />
                  <div className='flex-1'>
                    <h3 className='font-semibold'>{i.name}</h3>
                    <p>
                      {i.quantity} x {i.price.toLocaleString('fr-CM')} Fcfa
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-xl font-bold text-red-600'>
                      {(i.price * i.quantity).toLocaleString('fr-CM')} Fcfa
                    </p>
                    <div className='flex items-center space-x-2 mt-2'>
                      <button
                        onClick={() => handleUpdateCart(i.id, -1)}
                        disabled={i.quantity <= 1}
                        className='bg-gray-200 p-1 rounded-full'
                      >
                        <Minus size={16} />
                      </button>
                      <span className='font-bold'>{i.quantity}</span>
                      <button
                        onClick={() => handleUpdateCart(i.id, 1)}
                        className='bg-gray-200 p-1 rounded-full'
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(i.id)}
                      className='text-red-500 mt-2'
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className='text-gray-500'>{t('Panier vide')}</p>
            )}
          </div>

          {/* Formulaire */}
          <div className='bg-white rounded-2xl shadow-xl p-8'>
            <h2 className='text-2xl font-bold mb-6 border-b pb-4'>
              {t('Infos client')}
            </h2>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder='Nom complet'
              className='w-full p-2 border mb-2'
            />
            <input
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder='Email'
              className='w-full p-2 border mb-2'
            />
            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder='Téléphone'
              className='w-full p-2 border mb-2'
            />
            <input
              type='date'
              value={deliveryDate}
              min={getTomorrowDate()}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className='w-full p-2 border mb-2'
            />
            <input
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder='Adresse'
              className='w-full p-2 border mb-2'
            />
            <textarea
              value={deliveryDetails}
              onChange={(e) => setDeliveryDetails(e.target.value)}
              placeholder='Détails'
              className='w-full p-2 border mb-2'
            />

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className='w-full p-2 border mb-2'
            >
              <option value='cash'>💵 Paiement à la livraison</option>
              <option value='orange-money'>📱 Orange Money</option>
              <option value='mtn-momo'>📱 MTN Mobile Money</option>
              <option value='card'>💳 Carte Bancaire</option>
            </select>

            {paymentStatus.message && (
              <div
                className={`mt-4 p-2 rounded ${
                  paymentStatus.state === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700 animate-pulse'
                }`}
              >
                {paymentStatus.message}
              </div>
            )}

            <h3 className='text-xl font-bold mt-6'>
              Total : {calculateTotal().toLocaleString('fr-CM')} Fcfa
            </h3>
            <motion.button
              onClick={handleValidateOrder}
              disabled={isDisabled}
              className='w-full mt-4 bg-red-600 text-white py-3 rounded-full'
            >
              {paymentStatus.state === 'pending'
                ? 'En attente…'
                : 'Valider la commande'}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CartPage
