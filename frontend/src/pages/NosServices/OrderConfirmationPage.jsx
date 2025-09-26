// src/components/OrderConfirmationPage.jsx (code corrigé)
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Truck, MapPin, User, Mail, Phone } from 'lucide-react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../context/CartContext'

const OrderConfirmationPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { orderDetails: stateOrderDetails } = location.state || {}
  const { t } = useTranslation()
  const { emptyCart } = useCart()

  const [searchParams] = useSearchParams()
  const transactionRef = searchParams.get('ref')

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (transactionRef) {
        // Cas du paiement Mobile Money
        try {
          const response = await fetch(
            `https://pleingaz-site-web.onrender.com/api/orders/by-transaction/${transactionRef}`
          )
          if (!response.ok) {
            throw new Error('Commande non trouvée')
          }
          const data = await response.json()
          setOrder(data)
          emptyCart()
        } catch (err) {
          console.error(err)
          setError(t('Impossible de charger les détails de la commande.'))
        } finally {
          setLoading(false)
        }
      } else if (stateOrderDetails) {
        // Cas du paiement à la livraison
        setOrder(stateOrderDetails)
        emptyCart()
        setLoading(false)
      } else {
        // Pas de données, retourner à l'accueil ou afficher un message d'erreur
        setError(t('Aucune information de commande trouvée.'))
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [transactionRef, stateOrderDetails, emptyCart, t])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen text-xl font-bold'>
        {t('Chargement des détails de la commande...')}
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className='flex items-center justify-center min-h-screen text-xl font-bold text-red-600'>
        {error}
        <motion.button
          onClick={() => navigate('/')}
          className='ml-4 bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-red-700 transition-colors'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t("Retour à l'accueil")}
        </motion.button>
      </div>
    )
  }

  return (
    <motion.div
      className='bg-gray-50 min-h-screen pt-24 pb-16 flex items-center justify-center'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className='container mx-auto px-4 max-w-2xl'>
        <motion.div
          className='bg-white rounded-2xl shadow-xl p-8 text-center'
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className='flex justify-center mb-6'>
            <CheckCircle className='text-green-500 h-24 w-24' />
          </div>
          <h1 className='text-3xl font-extrabold text-gray-800 mb-2'>
            {t('Commande validée avec succès !')}
          </h1>
          <p className='text-lg text-gray-600 mb-6'>
            {t(
              'Merci pour votre commande. Un agent va vous contacter sous peu.'
            )}
          </p>

          {/* Infos principales */}
          <div className='border-t border-b py-6 mb-6'>
            <div className='flex justify-between items-center mb-2'>
              <h3 className='font-bold text-gray-700'>
                {t('Numéro de commande :')}
              </h3>
              <span className='font-mono text-gray-800'>
                {order.orderNumber}
              </span>
            </div>
            <div className='flex justify-between items-center mb-2'>
              <h3 className='font-bold text-gray-700'>{t('Total :')}</h3>
              <span className='font-extrabold text-red-600 text-2xl'>
                {order.totalAmount.toLocaleString('fr-CM')} {t('Fcfa')}
              </span>
            </div>
          </div>

          {/* Infos client */}
          <div className='bg-gray-100 p-4 rounded-lg text-left mb-6'>
            <div className='flex items-center text-red-600 mb-2'>
              <User size={24} className='mr-2' />
              <h4 className='font-bold'>{t('Informations client')}</h4>
            </div>
            <p className='text-gray-700 font-semibold mb-1'>
              <User size={16} className='inline mr-2 text-gray-600' />
              {t('Nom :')} {order.customerName}
            </p>
            <p className='text-gray-700 font-semibold mb-1'>
              <Mail size={16} className='inline mr-2 text-gray-600' />
              {t('Email :')} {order.customerEmail}
            </p>
            <p className='text-gray-700 font-semibold'>
              <Phone size={16} className='inline mr-2 text-gray-600' />
              {t('Téléphone :')} {order.customerPhone}
            </p>
          </div>

          {/* Livraison & Paiement */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8'>
            <div className='bg-gray-100 p-4 rounded-lg'>
              <div className='flex items-center text-red-600 mb-2'>
                <Truck size={24} className='mr-2' />
                <h4 className='font-bold'>{t('Livraison')}</h4>
              </div>
              <p className='text-gray-700 font-semibold'>
                {t('Date prévue :')} {order.deliveryDate}
              </p>
              <p className='text-gray-600 text-sm mt-1'>
                <MapPin size={16} className='inline mr-1' />{' '}
                {order.deliveryAddress}
              </p>
            </div>

            <div className='bg-gray-100 p-4 rounded-lg'>
              <div className='flex items-center text-red-600 mb-2'>
                <MapPin size={24} className='mr-2' />
                <h4 className='font-bold'>{t('Paiement')}</h4>
              </div>
              <p className='text-gray-700 font-semibold'>
                {t('Méthode :')} {order.paymentMethod}
              </p>
              <p className='text-gray-600 text-sm'>
                {t('Vous payez à la réception.')}
              </p>
            </div>
          </div>

          {/* Liste des articles */}
          <h2 className='text-xl font-bold text-gray-800 mb-4'>
            {t('Articles commandés')}
          </h2>
          <ul className='text-left space-y-2 mb-8'>
            {order.items.map((item, idx) => (
              <li
                key={idx}
                className='flex justify-between border-b pb-2 items-center'
              >
                <div className='flex items-center'>
                  <span>
                    {t(item.name)} (x{item.quantity})
                  </span>
                </div>
                <span className='font-semibold text-red-600'>
                  {(item.price * item.quantity).toLocaleString('fr-CM')}{' '}
                  {t('Fcfa')}
                </span>
              </li>
            ))}
          </ul>

          <motion.button
            onClick={() => navigate('/')}
            className='bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-red-700 transition-colors'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t("Retour à l'accueil")}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default OrderConfirmationPage
