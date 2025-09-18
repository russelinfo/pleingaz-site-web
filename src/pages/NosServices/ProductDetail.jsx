// src/pages/nos service/ProductDetail.jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, ArrowLeft, ShoppingCart, Trash2 } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import products from '../../data/products'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation() // Import du hook de traduction
  const { cart, addToCart, handleUpdateCart, totalItemsInCart } = useCart()

  const [product, setProduct] = useState(null)
  const [selectedPrice, setSelectedPrice] = useState('full')

  // Fonction pour déterminer le cartId unique
  const getCartId = (prod) => {
    if (prod.isGasBottle) {
      return `${prod.id}-${selectedPrice}`
    }
    return prod.id
  }

  // L'effet met à jour le produit et le cartId lorsque l'ID de l'URL ou le prix sélectionné change
  useEffect(() => {
    const foundProduct = products.find((p) => p.id === id)
    if (foundProduct) {
      setProduct(foundProduct)
    } else {
      navigate('/products')
    }
  }, [id, navigate])

  if (!product) {
    return null
  }

  // Utilise toujours la dernière version du cartId pour l'accès au panier
  const currentCartId = getCartId(product)
  const itemInCart = cart[currentCartId] || { quantity: 0 }
  const quantityInCart = itemInCart.quantity

  const handleUpdate = (action) => {
    // Vérification de la sélection de prix pour les bouteilles de gaz
    if (product.isGasBottle && !selectedPrice) {
      alert(t('Veuillez sélectionner une option de prix pour le gaz.'))
      return
    }

    if (action === 'add') {
      if (quantityInCart === 0) {
        addToCart({ ...product, price: getPriceValue() }, selectedPrice)
      } else {
        handleUpdateCart(currentCartId, 1)
      }
    } else if (action === 'remove') {
      handleUpdateCart(currentCartId, -1)
    }
  }

  const getPriceValue = () => {
    if (product.isGasBottle) {
      return selectedPrice === 'full' ? product.fullPrice : product.emptyPrice
    }
    return product.price
  }

  return (
    <motion.div
      className='bg-gray-50 min-h-screen pt-24 pb-16'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='container mx-auto px-4'>
        {/* En-tête avec bouton de retour et panier */}
        <div className='flex justify-between items-center mb-8'>
          <motion.button
            onClick={() => navigate(-1)}
            className='flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors'
            whileHover={{ x: -5 }}
          >
            <ArrowLeft size={20} className='mr-2' />
            <span className='text-lg'>{t('Retour aux produits')}</span>
          </motion.button>

          <motion.a
            href='/cart'
            className='relative bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors'
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ShoppingCart size={24} />
            {totalItemsInCart > 0 && (
              <span className='absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-full'>
                {totalItemsInCart}
              </span>
            )}
          </motion.a>
        </div>

        {/* Contenu principal de la page de détails */}
        <div className='bg-white rounded-2xl shadow-xl p-8 flex flex-col md:flex-row gap-8'>
          {/* Image du produit */}
          <div className='md:w-1/2 flex justify-center items-center'>
            <img
              src={product.image}
              alt={t(product.name)}
              className='max-h-[400px] object-contain'
            />
          </div>

          {/* Informations sur le produit */}
          <div className='md:w-1/2'>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
              {t(product.name)}
            </h1>

            {/* Description détaillée */}
            <p className='text-lg text-gray-700 leading-relaxed mb-6'>
              {t(product.description)}
            </p>

            {/* Prix et radios */}
            <div className='mb-6'>
              {product.isGasBottle ? (
                <div className='flex flex-col space-y-2'>
                  <label className='flex items-center space-x-3 cursor-pointer'>
                    <input
                      type='radio'
                      name={`price-${product.id}`}
                      checked={selectedPrice === 'full'}
                      onChange={() => setSelectedPrice('full')}
                      className='w-5 h-5 accent-red-600 cursor-pointer'
                    />
                    <span>
                      {t('Prix complet')}:{' '}
                      {product.fullPrice.toLocaleString('fr-CM')} {t('Fcfa')}
                    </span>
                  </label>
                  <label className='flex items-center space-x-3 cursor-pointer'>
                    <input
                      type='radio'
                      name={`price-${product.id}`}
                      checked={selectedPrice === 'empty'}
                      onChange={() => setSelectedPrice('empty')}
                      className='w-5 h-5 accent-red-600 cursor-pointer'
                    />
                    <span>
                      {t('Prix vide')}:{' '}
                      {product.emptyPrice.toLocaleString('fr-CM')} {t('Fcfa')}
                    </span>
                  </label>
                </div>
              ) : (
                <div>
                  <span className='font-bold text-red-600 text-lg'>
                    {t('Prix')}:
                  </span>
                  <span className='ml-2 text-2xl font-bold text-red-600'>
                    {product.price.toLocaleString('fr-CM')} {t('Fcfa')}
                  </span>
                </div>
              )}
            </div>

            {/* Caractéristiques */}
            {product.features && (
              <div className='mb-6'>
                <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                  {t('Caractéristiques')}
                </h3>
                <ul className='list-disc list-inside space-y-1 text-gray-700'>
                  {product.features.map((feature, index) => (
                    <li key={index}>{t(feature)}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Zone de contrôle de la quantité et boutons d'ajout/retrait */}
            <div className='flex flex-col space-y-4'>
              {product.inStock ? (
                <>
                  {(quantityInCart || 0) > 0 ? (
                    // Affichage des boutons +/- et de la quantité
                    <div className='flex items-center space-x-2'>
                      <button
                        onClick={() => handleUpdate('remove')}
                        className='bg-white text-red-600 px-4 py-2 rounded-full font-semibold flex items-center space-x-2 hover:bg-gray-200 transition-colors'
                      >
                        <Trash2 size={16} />
                        <span>{t('retirer')}</span>
                      </button>
                      <span className='font-bold text-center w-6 text-xl'>
                        {quantityInCart}
                      </span>
                      <button
                        onClick={() => handleUpdate('add')}
                        className='bg-white text-red-600 px-4 py-2 rounded-full font-semibold flex items-center space-x-2 hover:bg-gray-200 transition-colors'
                      >
                        <ShoppingCart size={16} />
                        <span>{t('Ajouter')}</span>
                      </button>
                    </div>
                  ) : (
                    // Affichage du bouton "Ajouter au panier"
                    <button
                      onClick={() => handleUpdate('add')}
                      className={`bg-red-600 text-white px-6 py-3 rounded-full font-bold text-lg hover:bg-red-700 transition-colors ${
                        product.isGasBottle && !selectedPrice
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                      disabled={product.isGasBottle && !selectedPrice}
                    >
                      {t('Ajouter au panier')}
                    </button>
                  )}
                </>
              ) : (
                <span className='text-red-500 font-bold text-lg'>
                  {t('Rupture de stock')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductDetail
