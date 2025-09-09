// src/pages/nos service/ProductsPage.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ShoppingCart, Plus, Minus, Eye } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'

// Importe les images (assure-toi que ces chemins sont corrects)
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
  {
    id: 'prod01',
    name: 'Bouteille de gaz 6 kg',
    image: btn6,
    description: 'Bouteille en acier robuste, livrée pleine de 6 kg de GPL.',
    fullPrice: 16120,
    emptyPrice: 3120,
    isGasBottle: true,
    inStock: true,
  },
  {
    id: 'prod02',
    name: 'Bouteille de gaz 12,5 kg',
    image: btn125,
    description:
      'Bouteille robuste contenant 12,5 kg de GPL. Adaptée aux besoins domestiques réguliers.',
    fullPrice: 26500,
    emptyPrice: 6500,
    isGasBottle: true,
    inStock: true,
  },
  {
    id: 'prod03',
    name: 'Bouteille de gaz 50 kg',
    image: btn50,
    description:
      'Grande bouteille de 50 kg pour usages intensifs. Idéale pour restaurants, hôtels et industries.',
    fullPrice: 76000,
    emptyPrice: 26000,
    isGasBottle: true,
    inStock: true,
  },
  {
    id: 'prod04',
    name: 'Plaque à gaz en verre',
    image: vitrer,
    description:
      'Table de cuisson moderne en verre trempé. Élégante et facile à nettoyer.',
    price: 18000,
    isGasBottle: false,
    inStock: true,
  },
  {
    id: 'prod05',
    name: 'Plaque à gaz en acier',
    image: classic,
    description:
      'Table de cuisson robuste et économique. Adaptée aux usages domestiques quotidiens.',
    price: 16000,
    isGasBottle: false,
    inStock: true,
  },
  {
    id: 'prod06',
    name: 'Détendeur pour bouteille 12,5 kg',
    image: detenteur,
    description:
      'Régulateur de pression pour bouteilles 12,5 kg à robinet. Sécurité et régulation optimale.',
    price: 3000,
    isGasBottle: false,
    inStock: true,
  },
  {
    id: 'prod07',
    name: 'Détendeur pour bouteille 6 kg',
    image: detenteur2,
    description:
      'Détendeur conçu pour bouteilles 6 kg à valve. Simple à visser, sûr et pratique.',
    price: 3000,
    isGasBottle: false,
    inStock: true,
  },
  {
    id: 'prod08',
    name: 'Tuyau de gaz',
    image: tuyo,
    description:
      'Tuyau pour relier bouteille et appareil. Garantit une alimentation en gaz sûre.',
    price: 2000,
    isGasBottle: false,
    inStock: true,
  },
  {
    id: 'prod09',
    name: 'Brûleur vissable pour bouteille 6 kg',
    image: bruleur,
    description:
      'Brûleur à fixer directement sur la valve. Solution simple et mobile pour cuisson rapide.',
    price: 1500,
    isGasBottle: false,
    inStock: false, // Exemple de produit en rupture de stock
  },
]

const ProductsPage = () => {
  
  const [searchTerm, setSearchTerm] = useState('')
  const { cart, handleUpdateCart, totalItemsInCart } = useCart()
  const navigate = useNavigate()

  // Filtrer les produits en fonction de la barre de recherche
  const filteredProducts = productsData.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Logique pour la navigation vers la page de détails
  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`)
  }

  return (
    <div className='bg-gray-50 min-h-screen pt-20 pb-16'>
      <div className='container mx-auto px-4'>
        {/* En-tête de la page */}
        <motion.div
          className='flex flex-col md:flex-row justify-between items-center mb-12'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className='text-4xl font-extrabold text-gray-800 mb-4 md:mb-0'>
            Nos Produits
          </h1>
          <div className='flex items-center space-x-4'>
            {/* Barre de recherche */}
            <div className='relative'>
              <input
                type='text'
                placeholder='Rechercher un produit...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full md:w-80 pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:ring-red-500 focus:border-red-500 transition-colors'
              />
              <Search
                className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                size={20}
              />
            </div>
            {/* Icône du panier */}
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

        {/* Grille de produits */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              className='bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col'
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className='relative w-full h-48 flex justify-center items-center p-4 bg-gray-100'>
                <img
                  src={product.image}
                  alt={product.name}
                  className='max-h-full object-contain'
                />
              </div>
              <div className='p-6 flex-1 flex flex-col'>
                <h3 className='text-xl font-bold text-gray-800 mb-2'>
                  {product.name}
                </h3>
                <p className='text-sm text-gray-600 mb-4 flex-1'>
                  {product.description}
                </p>
                <div className='flex justify-between items-center mb-4'>
                  {product.isGasBottle ? (
                    <div className='text-sm text-gray-700'>
                      <span className='font-bold text-red-600'>
                        Bouteille+GPL:
                      </span>{' '}
                      {product.fullPrice.toLocaleString('fr-CM')} Fcfa
                      <br />
                      <span className='font-bold text-red-600'>
                        Gaz seul:
                      </span>{' '}
                      {product.emptyPrice.toLocaleString('fr-CM')} Fcfa
                    </div>
                  ) : (
                    <span className='text-xl font-bold text-red-600'>
                      {product.price.toLocaleString('fr-CM')} Fcfa
                    </span>
                  )}
                </div>

                <div className='flex items-center justify-between mt-auto space-x-2'>
                  {product.inStock ? (
                    <>
                      {/* Contrôles de quantité */}
                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={() => handleUpdateCart(product.id, -1)}
                          className='bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50'
                          disabled={!cart[product.id] || cart[product.id] <= 0}
                        >
                          <Minus size={16} />
                        </button>
                        <span className='font-bold w-6 text-center'>
                          {cart[product.id] || 0}
                        </span>
                        <button
                          onClick={() => handleUpdateCart(product.id, 1)}
                          className='bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors'
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Bouton Voir les détails */}
                      <button
                        onClick={() => handleViewDetails(product.id)}
                        className='flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors font-semibold'
                      >
                        <Eye size={18} /> <span>Détails</span>
                      </button>
                    </>
                  ) : (
                    <span className='text-red-500 font-bold'>
                      Rupture de stock
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
