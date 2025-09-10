// src/components/OrderConfirmationPage.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Truck, MapPin } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const OrderConfirmationPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { orderDetails } = location.state || {}

  const sampleOrder = {
    orderNumber: 'PGZ-000000',
    totalAmount: 0,
    deliveryDate: '-',
    deliveryAddress: 'Non spécifiée',
    paymentMethod: 'Non spécifié',
    items: [],
  }

  const order = orderDetails || sampleOrder

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
            Commande validée avec succès !
          </h1>
          <p className='text-lg text-gray-600 mb-6'>
            Merci pour votre commande. Un agent va vous contacter sous peu.
          </p>

          {/* Infos principales */}
          <div className='border-t border-b py-6 mb-6'>
            <div className='flex justify-between items-center mb-2'>
              <h3 className='font-bold text-gray-700'>Numéro :</h3>
              <span className='font-mono text-gray-800'>
                {order.orderNumber}
              </span>
            </div>
            <div className='flex justify-between items-center mb-2'>
              <h3 className='font-bold text-gray-700'>Total :</h3>
              <span className='font-extrabold text-red-600 text-2xl'>
                {order.totalAmount.toLocaleString('fr-CM')} Fcfa
              </span>
            </div>
          </div>

          {/* Livraison & Paiement */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8'>
            <div className='bg-gray-100 p-4 rounded-lg'>
              <div className='flex items-center text-red-600 mb-2'>
                <Truck size={24} className='mr-2' />
                <h4 className='font-bold'>Livraison</h4>
              </div>
              <p className='text-gray-700 font-semibold'>
                Date prévue : {order.deliveryDate}
              </p>
              <p className='text-gray-600 text-sm'>
                <MapPin size={16} className='inline mr-1' />{' '}
                {order.deliveryAddress}
              </p>
            </div>

            <div className='bg-gray-100 p-4 rounded-lg'>
              <div className='flex items-center text-red-600 mb-2'>
                <MapPin size={24} className='mr-2' />
                <h4 className='font-bold'>Paiement</h4>
              </div>
              <p className='text-gray-700 font-semibold'>
                Méthode : {order.paymentMethod}
              </p>
              <p className='text-gray-600 text-sm'>
                Vous payez à la réception.
              </p>
            </div>
          </div>

          {/* Liste des articles */}
          <h2 className='text-xl font-bold text-gray-800 mb-4'>
            Articles commandés
          </h2>
          <ul className='text-left space-y-2 mb-8'>
            {order.items.map((item, idx) => (
              <li key={idx} className='flex justify-between border-b pb-2'>
                <span>
                  {item.name} (x{item.quantity})
                </span>
                <span className='font-semibold text-red-600'>
                  {(item.price * item.quantity).toLocaleString('fr-CM')} Fcfa
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
            Retour à l'accueil
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default OrderConfirmationPage
