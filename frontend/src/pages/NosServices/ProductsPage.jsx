// src/pages/nos service/ProductsPage.jsx
import React, { useState, useEffect } from 'react' // AJOUT DE useEffect
import { motion } from 'framer-motion'
import { Search, ShoppingCart, Plus, Minus, Eye, Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'
// SUPPRESSION: import products from '../../data/products'
import { useTranslation } from 'react-i18next'

const ProductsPage = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const { cart, addToCart, handleUpdateCart, totalItemsInCart } = useCart()
  const navigate = useNavigate()
  const [selectedPrices, setSelectedPrices] = useState({})

  // NOUVEL ÉTAT POUR GÉRER LES DONNÉES DE L'API, LE CHARGEMENT ET LES ERREURS
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // HOOK POUR FAIRE L'APPEL API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          'https://pleingaz-site-web.onrender.com/api/products'
        )
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        const data = await response.json()
        setProducts(data) // Met à jour l'état avec les données du backend
      } catch (err) {
        console.error('Erreur lors de la récupération des produits:', err)
        setError(
          'Impossible de récupérer les produits. Veuillez réessayer plus tard.'
        )
      } finally {
        setLoading(false) // Le chargement est terminé
      }
    }

    fetchProducts()
  }, []) // Le tableau vide [] s'assure que cet effet ne s'exécute qu'une seule fois au chargement du composant

  // GESTION DU CHARGEMENT ET DES ERREURS
  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen text-gray-700'>
        Chargement des produits...
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen text-red-500'>
        {error}
      </div>
    )
  }

  // MODIFIÉ: Le filtre utilise maintenant la variable `products` de l'état
  const filteredProducts = products.filter((product) =>
    t(product.name).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`)
  }

  const handlePriceSelection = (productId, priceType) => {
    setSelectedPrices((prev) => ({
      ...prev,
      [productId]: priceType,
    }))
  }

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

  const handleAddToCart = (product) => {
    const cartId = getCartId(product)
    const priceType = selectedPrices[product.id]
    let priceValue

    if (product.isGasBottle) {
      if (priceType === 'full') {
        priceValue = getPriceValue(product.fullPrice)
      } else if (priceType === 'empty') {
        priceValue = getPriceValue(product.emptyPrice)
      } else {
        alert(t('Veuillez sélectionner une option de prix pour la bouteille.'))
        return
      }
    } else {
      priceValue = getPriceValue(product.price)
    }

    if (cart[cartId] && cart[cartId].quantity > 0) {
      handleUpdateCart(cartId, 1)
    } else {
      addToCart({ ...product, price: priceValue }, priceType)
    }
  }

  const getCartId = (product) => {
    if (product.isGasBottle) {
      const choice = selectedPrices[product.id]
      if (choice === 'full') return product.id + '-full'
      if (choice === 'empty') return product.id + '-empty'
    }
    return product.id
  }

  return (
    <div className='bg-gray-50 min-h-screen pt-20 pb-16'>
      <div className='container mx-auto px-4'>
        <motion.div
          className='flex flex-col md:flex-row justify-between items-center mb-12'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className='text-4xl font-extrabold text-gray-800 mb-4 md:mb-0'>
            {t('Nos Produits')}
          </h1>
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <input
                type='text'
                placeholder={t('Rechercher un produit...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full md:w-80 pl-10 pr-4 py-2 rounded-full border border-gray-300
                 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors outline-none'
              />
              <Search
                className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                size={20}
              />
            </div>
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
        </motion.div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
          {filteredProducts.map((product) => {
            const cartId = getCartId(product)
            const itemInCart = cart[cartId]

            return (
              <motion.div
                key={product.id}
                className='bg-red-600 text-white rounded-2xl shadow-xl overflow-hidden flex flex-col'
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className='relative w-full h-48 flex justify-center items-center p-4 bg-white'>
                  <img
                    src={product.image}
                    alt={t(product.name)}
                    className='max-h-full object-contain'
                  />
                </div>

                <div className='p-6 flex-1 flex flex-col'>
                  <h3 className='text-xl font-bold mb-2'>{t(product.name)}</h3>
                  <p className='text-sm opacity-90 mb-4 flex-1'>
                    {t(product.description)}
                  </p>

                  <div className='mb-4'>
                    {product.isGasBottle ? (
                      <div className='flex flex-col space-y-3'>
                        <label className='flex items-center space-x-4 cursor-pointer'>
                          <input
                            type='radio'
                            name={`price-${product.id}`}
                            checked={selectedPrices[product.id] === 'full'}
                            onChange={() =>
                              handlePriceSelection(product.id, 'full')
                            }
                            className='w-6 h-6 accent-red-600 cursor-pointer'
                          />
                          <span className='text-lg font-medium'>
                            {' '}
                            {t('Bouteille + GPL')}:{' '}
                            {product.fullPrice?.toLocaleString('fr-CM') ||
                              'N/A'}{' '}
                            {t('Fcfa')}
                          </span>
                        </label>
                        <label className='flex items-center space-x-4 cursor-pointer'>
                          <input
                            type='radio'
                            name={`price-${product.id}`}
                            checked={selectedPrices[product.id] === 'empty'}
                            onChange={() =>
                              handlePriceSelection(product.id, 'empty')
                            }
                            className='w-6 h-6 accent-red-600 cursor-pointer'
                          />
                          <span className='text-lg font-medium'>
                            {' '}
                            {t('Gaz seul')}:{' '}
                            {product.emptyPrice?.toLocaleString('fr-CM') ||
                              'N/A'}{' '}
                            {t('Fcfa')}
                          </span>
                        </label>
                      </div>
                    ) : (
                      <span className='text-xl font-bold'>
                        {t('Prix')}:{' '}
                        {getPriceValue(product.price).toLocaleString('fr-CM')}{' '}
                        {t('Fcfa')}
                      </span>
                    )}
                  </div>

                  <div className='flex items-center justify-between mt-auto space-x-2'>
                    {product.inStock ? (
                      <>
                        <div className='flex items-center space-x-2'>
                          {(itemInCart?.quantity || 0) > 0 ? (
                            <>
                              <button
                                onClick={() => {
                                  if (
                                    product.isGasBottle &&
                                    !selectedPrices[product.id]
                                  ) {
                                    alert(
                                      t(
                                        'Veuillez sélectionner une option de prix pour la bouteille.'
                                      )
                                    )
                                    return
                                  }
                                  handleUpdateCart(cartId, -1)
                                }}
                                className={`bg-white text-red-600 px-3 py-2 rounded-full font-semibold flex items-center space-x-2 hover:bg-gray-200 transition-colors`}
                              >
                                <Minus size={16} />
                              </button>
                              <span className='font-bold w-6 text-center text-xl'>
                                {itemInCart.quantity}
                              </span>
                              <button
                                onClick={() => {
                                  if (
                                    product.isGasBottle &&
                                    !selectedPrices[product.id]
                                  ) {
                                    alert(
                                      t(
                                        'Veuillez sélectionner une option de prix pour la bouteille.'
                                      )
                                    )
                                    return
                                  }
                                  handleAddToCart(product)
                                }}
                                className={`bg-white text-red-600 px-3 py-2 rounded-full font-semibold flex items-center space-x-2 hover:bg-gray-200 transition-colors`}
                              >
                                <Plus size={16} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                if (
                                  product.isGasBottle &&
                                  !selectedPrices[product.id]
                                ) {
                                  alert(
                                    t(
                                      'Veuillez sélectionner une option de prix pour la bouteille.'
                                    )
                                  )
                                  return
                                }
                                handleAddToCart(product)
                              }}
                              className={`bg-white text-red-600 px-4 py-2 rounded-full font-semibold flex items-center space-x-2 hover:bg-gray-200 transition-colors ${
                                product.isGasBottle &&
                                !selectedPrices[product.id]
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                              disabled={
                                product.isGasBottle &&
                                !selectedPrices[product.id]
                              }
                            >
                              <ShoppingCart size={16} />
                              <span>{t('Ajouter au panier')}</span>
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => handleViewDetails(product.id)}
                          className='flex items-center space-x-2 hover:underline font-semibold'
                        >
                          <Eye size={18} /> <span>{t('Détails')}</span>
                        </button>
                      </>
                    ) : (
                      <span className='font-bold text-yellow-300'>
                        {t('Rupture de stock')}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
