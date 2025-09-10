// src/components/CartPage.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

// Importe les images
import btn6 from '../../assets/images/btn6.png'
import btn125 from '../../assets/images/btn12.5.png'
import btn50 from '../../assets/images/btn50.png'
import vitrer from '../../assets/images/vitrer.png'
import classic from '../../assets/images/classic.png'
import detenteur from '../../assets/images/detenteur.png'
import detenteur2 from '../../assets/images/detenteur2.png'
import tuyo from '../../assets/images/tuyo.png'
import bruleur from '../../assets/images/bruleur.png'

const productsData = [
  { id: 'prod01', name: 'Bouteille de gaz 6 kg', image: btn6, price: 16120 },
  {
    id: 'prod02',
    name: 'Bouteille de gaz 12,5 kg',
    image: btn125,
    price: 26500,
  },
  { id: 'prod03', name: 'Bouteille de gaz 50 kg', image: btn50, price: 76000 },
  { id: 'prod04', name: 'Plaque à gaz en verre', image: vitrer, price: 18000 },
  { id: 'prod05', name: 'Plaque à gaz en acier', image: classic, price: 16000 },
  {
    id: 'prod06',
    name: 'Détendeur pour bouteille 12,5 kg',
    image: detenteur,
    price: 3000,
  },
  {
    id: 'prod07',
    name: 'Détendeur pour bouteille 6 kg',
    image: detenteur2,
    price: 3000,
  },
  { id: 'prod08', name: 'Tuyau de gaz', image: tuyo, price: 2000 },
  {
    id: 'prod09',
    name: 'Brûleur vissable pour bouteille 6 kg',
    image: bruleur,
    price: 1500,
  },
]

const CartPage = () => {
  const navigate = useNavigate()
  // Utilise la nouvelle fonction `emptyCart` du contexte
  const { cart, handleUpdateCart, emptyCart } = useCart()
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryDetails, setDeliveryDetails] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Paiement à la livraison')

  // Fusionner les données avec les produits du panier de manière sécurisée
  const cartItems = Object.keys(cart || {})
    .map((id) => {
      const product = productsData.find((p) => p.id === id)
      return product ? { ...product, quantity: cart[id] } : null
    })
    .filter((item) => item !== null) // Filtrer les articles non trouvés

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  }

  const handleRemoveItem = (id) => {
    handleUpdateCart(id, -cart[id])
  }

  const handleValidateOrder = () => {
    if (cartItems.length === 0) {
      alert(
        'Votre panier est vide. Veuillez ajouter des articles pour commander.'
      )
      return
    }

    if (!deliveryDate || !deliveryAddress) {
      alert("Veuillez remplir la date et l'adresse de livraison.")
      return
    }

    const orderDetails = {
      cartItems,
      deliveryDate,
      deliveryAddress,
      deliveryDetails,
      paymentMethod,
      total: calculateTotal(),
    }

    // Vider le panier après la validation de la commande
    emptyCart()

    navigate('/order-confirmation', { state: orderDetails })
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
        {/* En-tête */}
        <div className='flex items-center justify-between mb-8'>
          <h1 className='text-4xl font-extrabold text-gray-800'>
            Votre Panier
          </h1>
          <motion.button
            onClick={() => navigate(-1)}
            className='flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors'
            whileHover={{ x: -5 }}
          >
            <ArrowLeft size={20} className='mr-2' />
            Continuer mes achats
          </motion.button>
        </div>

        {/* Contenu */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Récapitulatif */}
          <div className='lg:col-span-2 bg-white rounded-2xl shadow-xl p-8'>
            <h2 className='text-2xl font-bold text-gray-800 mb-6 border-b pb-4'>
              Récapitulatif de votre commande
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
                        Quantité : {item.quantity}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-xl font-bold text-red-600'>
                        {(item.price * item.quantity).toLocaleString('fr-CM')}{' '}
                        Fcfa
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className='text-red-500 hover:text-red-700 transition-colors'
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className='text-center text-gray-500 text-lg'>
                  Votre panier est vide.
                </p>
              )}
            </div>
          </div>

          {/* Livraison */}
          <div className='bg-white rounded-2xl shadow-xl p-8'>
            <h2 className='text-2xl font-bold text-gray-800 mb-6 border-b pb-4'>
              Informations de livraison
            </h2>
            <div className='space-y-6'>
              <div>
                <label
                  htmlFor='deliveryDate'
                  className='block text-sm font-medium text-gray-700'
                >
                  Date de livraison
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
                  Votre adresse
                </label>
                <input
                  type='text'
                  id='deliveryAddress'
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder='Ex: Rue 5, Quartier des Fleurs'
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500'
                  required
                />
              </div>
              <div>
                <label
                  htmlFor='deliveryDetails'
                  className='block text-sm font-medium text-gray-700'
                >
                  Détails (à côté de…)
                </label>
                <textarea
                  id='deliveryDetails'
                  value={deliveryDetails}
                  onChange={(e) => setDeliveryDetails(e.target.value)}
                  placeholder='Ex: Maison à côté de la pharmacie du carrefour'
                  rows='3'
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500'
                />
              </div>
              <div>
                <h3 className='text-xl font-bold text-gray-800 mb-2'>
                  Mode de paiement
                </h3>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className='block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500'
                >
                  <option value='Paiement à la livraison'>
                    Paiement à la livraison
                  </option>
                  <option value='Mobile Money (MTN/Orange)'>
                    Mobile Money (MTN/Orange)
                  </option>
                </select>
              </div>
            </div>

            <div className='mt-8'>
              <h3 className='text-2xl font-bold text-gray-800'>
                Total de la commande
              </h3>
              <p className='text-4xl font-extrabold text-red-600 mt-2'>
                {calculateTotal().toLocaleString('fr-CM')} Fcfa
              </p>
              <motion.button
                onClick={handleValidateOrder}
                className='w-full mt-6 bg-red-600 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:bg-red-700 transition-colors disabled:opacity-50'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={cartItems.length === 0}
              >
                Valider la commande
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CartPage
