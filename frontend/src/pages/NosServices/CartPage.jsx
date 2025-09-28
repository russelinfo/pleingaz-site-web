// frontend/src/pages/CartPage.jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useTranslation } from 'react-i18next'

// Images import
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

  // États pour les informations client
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryDetails, setDeliveryDetails] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')

  // Produits depuis le backend
  const [allProducts, setAllProducts] = useState([])

  // État de paiement
  const [paymentStatus, setPaymentStatus] = useState({
    state: 'idle', // idle | processing | pending | info | redirect | success | warning | error
    message: '',
  })

  // Charger les produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/products`)
        if (!res.ok) throw new Error('Erreur chargement produits')
        const data = await res.json()
        setAllProducts(data)
      } catch (err) {
        console.error('Erreur chargement produits:', err)
      }
    }
    fetchProducts()
  }, [])

  // Helper functions
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

  const getTomorrowDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  }

  // Polling avec gestion d'erreur améliorée
  const pollPayment = (reference, timeoutMs = 300000, intervalMs = 5000) => {
    return new Promise((resolve) => {
      const start = Date.now()
      let attempts = 0
      const maxAttempts = Math.floor(timeoutMs / intervalMs)

      const tick = async () => {
        attempts++
        try {
          const resp = await fetch(
            `${BACKEND_URL}/api/payments/verify/${reference}`
          )

          if (!resp.ok) {
            console.warn(
              `Polling attempt ${attempts} failed: HTTP ${resp.status}`
            )
            if (attempts >= maxAttempts) return resolve('error')
            setTimeout(tick, intervalMs)
            return
          }

          const data = await resp.json()
          const status = data.status

          console.log(`Polling attempt ${attempts}: status = ${status}`)

          if (status === 'complete') {
            return resolve('complete')
          }
          if (
            status === 'failed' ||
            status === 'canceled' ||
            status === 'abandoned'
          ) {
            return resolve('failed')
          }

          // Timeout check
          if (Date.now() - start > timeoutMs) {
            return resolve('timeout')
          }

          // Continue polling
          setTimeout(tick, intervalMs)
        } catch (err) {
          console.error(`Polling error (attempt ${attempts}):`, err)
          if (attempts >= maxAttempts) {
            return resolve('error')
          }
          // Retry after a longer delay on error
          setTimeout(tick, intervalMs * 2)
        }
      }

      tick()
    })
  }

  // Fonction principale de validation de commande
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

      const itemsPayload = cartItems.map((it) => ({
        productId: it.id.split('-')[0],
        quantity: it.quantity,
        unitPrice: it.price,
      }))
      const total = calculateTotal()

      // CASH ON DELIVERY - Création directe
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

      // PAIEMENT EN LIGNE
      setPaymentStatus({
        state: 'processing',
        message: t('Initialisation du paiement...'),
      })

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
      console.log('Payment initialization:', initData)

      if (!initResp.ok || !initData.success) {
        throw new Error(
          initData.error ||
            initData.details ||
            initData.message ||
            "Impossible d'initialiser le paiement"
        )
      }

      const reference = initData.reference
      const paymentType = initData.paymentType

      // FLUX AVEC REDIRECTION (actuel)
      if (paymentType === 'redirect' && initData.authorization_url) {
        // Message informatif pour Mobile Money
        if (paymentMethod === 'mtn-momo' || paymentMethod === 'orange-money') {
          setPaymentStatus({
            state: 'info',
            message:
              'Vous allez être redirigé vers la page de paiement. Suivez les instructions pour finaliser votre paiement mobile money.',
          })

          // Attendre 3 secondes pour que l'utilisateur lise le message
          setTimeout(() => {
            setPaymentStatus({
              state: 'redirect',
              message: t('Redirection en cours...'),
            })
            emptyCart()
            window.location.href = initData.authorization_url
          }, 3000)
        } else {
          // Carte bancaire - redirection immédiate
          setPaymentStatus({
            state: 'redirect',
            message: t('Redirection vers la page de paiement...'),
          })
          emptyCart()
          window.location.href = initData.authorization_url
        }
        return
      }

      // FLUX DIRECT (quand le compte sera activé)
      else if (paymentType === 'direct') {
        if (initData.ussdCode) {
          setPaymentStatus({
            state: 'pending',
            message: `Code USSD: ${initData.ussdCode}. Confirmez le paiement sur votre téléphone.`,
          })
        } else {
          setPaymentStatus({
            state: 'pending',
            message: t(
              'Confirmation de paiement envoyée sur votre téléphone. Veuillez confirmer.'
            ),
          })
        }

        // Polling pour vérifier le statut
        const final = await pollPayment(reference, 300000, 5000) // 5min timeout

        if (final === 'complete') {
          setPaymentStatus({
            state: 'success',
            message: t('Paiement confirmé ! Redirection...'),
          })
          emptyCart()
          navigate('/order-confirmation', {
            state: {
              orderDetails: {
                orderNumber: `PGZ-${initData.orderId || 'N/A'}`,
                totalAmount: total,
                deliveryDate,
                deliveryAddress,
                paymentMethod:
                  paymentMethod === 'mtn-momo'
                    ? 'MTN Mobile Money'
                    : paymentMethod === 'orange-money'
                    ? 'Orange Money'
                    : 'Carte bancaire',
                items: cartItems,
              },
            },
          })
        } else if (final === 'timeout') {
          setPaymentStatus({
            state: 'warning',
            message: t(
              'Délai dépassé. Vérifiez votre téléphone ou réessayez le paiement.'
            ),
          })
        } else {
          setPaymentStatus({
            state: 'error',
            message: t('Paiement échoué ou annulé.'),
          })
        }
      }

      // CAS PAR DÉFAUT - fallback sur redirection
      else {
        if (initData.authorization_url) {
          setPaymentStatus({
            state: 'redirect',
            message: t('Redirection vers la page de paiement...'),
          })
          emptyCart()
          window.location.href = initData.authorization_url
        } else {
          // Pas d'URL - tenter le polling
          setPaymentStatus({
            state: 'pending',
            message: t('Paiement en cours. Vérifiez votre téléphone.'),
          })

          const final = await pollPayment(reference, 180000, 5000) // 3min timeout
          if (final === 'complete') {
            setPaymentStatus({
              state: 'success',
              message: t('Paiement confirmé !'),
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
          } else {
            setPaymentStatus({
              state: 'error',
              message: t(
                'Paiement non confirmé. Contactez le support si le problème persiste.'
              ),
            })
          }
        }
      }
    } catch (err) {
      console.error('Erreur commande/paiement:', err)
      setPaymentStatus({
        state: 'error',
        message: err.message || 'Erreur lors du paiement. Veuillez réessayer.',
      })
    }
  }

  const isDisabled =
    cartItems.length === 0 ||
    paymentStatus.state === 'processing' ||
    paymentStatus.state === 'pending' ||
    paymentStatus.state === 'redirect' ||
    paymentStatus.state === 'info'

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
          {/* Section articles du panier */}
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
                          className='bg-gray-200 p-1 rounded-full hover:bg-gray-300 transition-colors'
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className='font-bold min-w-[30px] text-center'>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateCart(item.id, 1)}
                          className='bg-gray-200 p-1 rounded-full hover:bg-gray-300 transition-colors'
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className='text-red-500 hover:text-red-700 mt-2 transition-colors'
                        title='Supprimer cet article'
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className='text-center py-12'>
                  <p className='text-gray-500 text-lg mb-4'>
                    Votre panier est vide.
                  </p>
                  <button
                    onClick={() => navigate('/products')}
                    className='bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors'
                  >
                    Découvrir nos produits
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section informations et paiement */}
          <div className='bg-white rounded-2xl shadow-xl p-8'>
            <h2 className='text-2xl font-bold mb-6 border-b pb-4'>
              Informations client et livraison
            </h2>

            {/* Formulaire client */}
            <div className='space-y-4 mb-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nom complet *
                </label>
                <input
                  type='text'
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder='Votre nom complet'
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email *
                </label>
                <input
                  type='email'
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder='votre.email@exemple.com'
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Téléphone *
                </label>
                <input
                  type='tel'
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder='+237 6XX XXX XXX'
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Date de livraison *
                </label>
                <input
                  type='date'
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={getTomorrowDate()}
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Adresse de livraison *
                </label>
                <input
                  type='text'
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder='Quartier, rue, détails...'
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Détails supplémentaires
                </label>
                <textarea
                  value={deliveryDetails}
                  onChange={(e) => setDeliveryDetails(e.target.value)}
                  placeholder='Instructions spéciales, repères, horaires préférés...'
                  rows={3}
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Mode de paiement *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent'
                >
                  <option value='cash'>💵 Paiement à la livraison</option>
                  <option value='orange-money'>📱 Orange Money</option>
                  <option value='mtn-momo'>📱 MTN Mobile Money</option>
                  <option value='card'>💳 Carte bancaire</option>
                </select>
              </div>
            </div>

            {/* Status de paiement */}
            {paymentStatus.state !== 'idle' && (
              <div
                className={`mb-6 p-4 rounded-lg font-medium border-l-4 ${
                  paymentStatus.state === 'processing'
                    ? 'bg-blue-50 text-blue-800 border-blue-400'
                    : paymentStatus.state === 'pending'
                    ? 'bg-yellow-50 text-yellow-800 border-yellow-400'
                    : paymentStatus.state === 'info'
                    ? 'bg-cyan-50 text-cyan-800 border-cyan-400'
                    : paymentStatus.state === 'redirect'
                    ? 'bg-purple-50 text-purple-800 border-purple-400'
                    : paymentStatus.state === 'success'
                    ? 'bg-green-50 text-green-800 border-green-400'
                    : paymentStatus.state === 'warning'
                    ? 'bg-orange-50 text-orange-800 border-orange-400'
                    : 'bg-red-50 text-red-800 border-red-400'
                }`}
              >
                <div className='flex items-center'>
                  {paymentStatus.state === 'processing' && (
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3'></div>
                  )}
                  {paymentStatus.state === 'pending' && (
                    <div className='animate-pulse h-4 w-4 bg-yellow-500 rounded-full mr-3'></div>
                  )}
                  {paymentStatus.state === 'redirect' && (
                    <div className='animate-bounce h-4 w-4 bg-purple-500 rounded-full mr-3'></div>
                  )}
                  {paymentStatus.state === 'success' && (
                    <div className='h-4 w-4 bg-green-500 rounded-full mr-3 flex items-center justify-center'>
                      <div className='h-2 w-2 bg-white rounded-full'></div>
                    </div>
                  )}
                  <span>{paymentStatus.message}</span>
                </div>

                {paymentStatus.state === 'pending' && (
                  <div className='mt-2 text-sm opacity-75'>
                    Cette opération peut prendre quelques minutes. Ne fermez pas
                    la page.
                  </div>
                )}

                {paymentStatus.state === 'info' && (
                  <div className='mt-2 text-sm opacity-75'>
                    Vous serez automatiquement redirigé dans quelques secondes.
                  </div>
                )}
              </div>
            )}

            {/* Récapitulatif total */}
            <div className='border-t pt-6'>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-gray-600'>Sous-total</span>
                <span className='font-semibold'>
                  {calculateTotal().toLocaleString('fr-CM')} Fcfa
                </span>
              </div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-gray-600'>Livraison</span>
                <span className='font-semibold text-green-600'>Gratuite</span>
              </div>
              <div className='border-t pt-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-xl font-bold'>Total</span>
                  <span className='text-3xl font-extrabold text-red-600'>
                    {calculateTotal().toLocaleString('fr-CM')} Fcfa
                  </span>
                </div>
              </div>

              {/* Bouton de validation */}
              <motion.button
                onClick={handleValidateOrder}
                disabled={isDisabled}
                className={`w-full mt-6 py-4 px-6 rounded-full font-bold text-lg transition-all duration-300 ${
                  isDisabled
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                }`}
                whileTap={{ scale: isDisabled ? 1 : 0.98 }}
              >
                {paymentStatus.state === 'processing' ? (
                  <div className='flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3'></div>
                    Initialisation...
                  </div>
                ) : paymentStatus.state === 'pending' ? (
                  'En attente de confirmation...'
                ) : paymentStatus.state === 'redirect' ? (
                  'Redirection en cours...'
                ) : paymentStatus.state === 'info' ? (
                  'Préparation du paiement...'
                ) : (
                  'Valider la commande'
                )}
              </motion.button>

              {/* Note de sécurité */}
              <div className='mt-4 text-xs text-gray-500 text-center'>
                🔒 Vos informations sont sécurisées et protégées
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CartPage
