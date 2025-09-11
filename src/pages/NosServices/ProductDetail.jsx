// src/pages/nos service/ProductDetail.jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, ArrowLeft, ShoppingCart, Trash2 } from 'lucide-react' // Ajout de l'icône Trash2
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

// Correction des chemins d'accès aux images pour la nouvelle structure de dossier
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
    description:
      'Bouteille en acier robuste, livrée pleine de 6 kg de GPL. Idéale pour petites familles et usages occasionnels. Cette bouteille à valve est facile à transporter et à utiliser pour tous vos besoins en cuisson et chauffage.',
    fullPrice: 16120,
    emptyPrice: 3120,
    isGasBottle: true,
    inStock: true,
    features: [
      'Capacité : 6 kg GPL',
      'Matériau : Acier renforcé',
      'Type : Bouteille à valve vissable',
    ],
  },
  {
    id: 'prod02',
    name: 'Bouteille de gaz 12,5 kg',
    image: btn125,
    description:
      'Bouteille robuste contenant 12,5 kg de GPL. Adaptée aux besoins domestiques réguliers, elle offre une autonomie prolongée pour la cuisine et les appareils domestiques.',
    fullPrice: 26500,
    emptyPrice: 6500,
    isGasBottle: true,
    inStock: true,
    features: [
      'Capacité : 12,5 kg GPL',
      'Matériau : Acier haute qualité',
      'Utilisation : Familiale et quotidienne',
    ],
  },
  {
    id: 'prod03',
    name: 'Bouteille de gaz 50 kg',
    image: btn50,
    description:
      'Grande bouteille de 50 kg pour usages intensifs. Idéale pour restaurants, hôtels et industries. Son robinet de haute sécurité garantit une utilisation sans risque pour les professionnels.',
    fullPrice: 76000,
    emptyPrice: 26000,
    isGasBottle: true,
    inStock: true,
    features: [
      'Capacité : 50 kg GPL',
      'Idéale pour professionnels',
      'Robinet de haute sécurité',
    ],
  },
  {
    id: 'prod04',
    name: 'Plaque à gaz en verre',
    image: vitrer,
    description:
      'Table de cuisson PLEINGAZ moderne en verre trempé. Élégante, résistante à la chaleur et facile à nettoyer, elle s’intègre parfaitement dans les cuisines contemporaines.',
    price: 18000,
    isGasBottle: false,
    inStock: true,
    features: [
      'Design moderne en verre trempé',
      'Facile à nettoyer',
      'Brûleurs performants',
    ],
  },
  {
    id: 'prod05',
    name: 'Plaque à gaz en acier',
    image: classic,
    description:
      'Table de cuisson robuste et économique. Adaptée aux usages domestiques quotidiens, sa conception durable en acier la rend résistante et facile d’entretien.',
    price: 16000,
    isGasBottle: false,
    inStock: true,
    features: [
      'Conception durable en acier',
      'Facile d’entretien',
      'Solution économique',
    ],
  },
  {
    id: 'prod06',
    name: 'Détendeur pour bouteille 12,5 kg',
    image: detenteur,
    description:
      'Régulateur de pression pour bouteilles 12,5 kg à robinet. Cet accessoire garantit une sécurité et une régulation optimale de votre flux de gaz pour un usage domestique sans souci.',
    price: 3000,
    isGasBottle: false,
    inStock: true,
    features: [
      'Compatible : bouteilles 12,5 kg à robinet',
      'Sécurité optimale',
      'Facile à installer',
    ],
  },
  {
    id: 'prod07',
    name: 'Détendeur pour bouteille 6 kg',
    image: detenteur2,
    description:
      'Détendeur PLEINGAZ conçu pour bouteilles 6 kg à valve. Simple à visser, sûr et pratique, il est l’accessoire indispensable pour votre petite bouteille.',
    price: 3000,
    isGasBottle: false,
    inStock: true,
    features: [
      'Compatible : bouteilles 6 kg à valve',
      'Simple à visser',
      'Robuste et sûr',
    ],
  },
  {
    id: 'prod08',
    name: 'Tuyau de gaz',
    image: tuyo,
    description:
      'Tuyau pour relier bouteille et appareil. Fabriqué en matériau résistant à la pression, il garantit une alimentation en gaz sûre et durable. (Longueur standard : 1.5 m)',
    price: 2000,
    isGasBottle: false,
    inStock: true,
    features: [
      'Longueur : 1.5 m',
      'Matériau résistant à la pression',
      'Connexion sécurisée',
    ],
  },
  {
    id: 'prod09',
    name: 'Brûleur vissable pour bouteille 6 kg',
    image: bruleur,
    description:
      'Brûleur à fixer directement sur la valve de votre bouteille de 6 kg. C’est une solution simple et mobile, idéale pour la cuisson en extérieur, en camping ou pour les petits espaces.',
    price: 1500,
    isGasBottle: false,
    inStock: false,
    features: [
      'Compact et portable',
      'Se visse directement sur la bouteille',
      'Idéal pour la cuisson rapide',
    ],
  },
]

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
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
    const foundProduct = productsData.find((p) => p.id === id)
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
      alert('Veuillez sélectionner une option de prix pour le gaz.')
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
            Retour à la liste des produits
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
              alt={product.name}
              className='max-h-[400px] object-contain'
            />
          </div>

          {/* Informations sur le produit */}
          <div className='md:w-1/2'>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
              {product.name}
            </h1>

            {/* Description détaillée */}
            <p className='text-lg text-gray-700 leading-relaxed mb-6'>
              {product.description}
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
                      Bouteille + GPL:{' '}
                      {product.fullPrice.toLocaleString('fr-CM')} Fcfa
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
                      Gaz seul: {product.emptyPrice.toLocaleString('fr-CM')}{' '}
                      Fcfa
                    </span>
                  </label>
                </div>
              ) : (
                <div>
                  <span className='font-bold text-red-600 text-lg'>Prix :</span>
                  <span className='ml-2 text-2xl font-bold text-red-600'>
                    {product.price.toLocaleString('fr-CM')} Fcfa
                  </span>
                </div>
              )}
            </div>

            {/* Caractéristiques */}
            {product.features && (
              <div className='mb-6'>
                <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                  Caractéristiques
                </h3>
                <ul className='list-disc list-inside space-y-1 text-gray-700'>
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
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
                        <span>Retirer</span>
                      </button>
                      <span className='font-bold text-center w-6 text-xl'>
                        {quantityInCart}
                      </span>
                      <button
                        onClick={() => handleUpdate('add')}
                        className='bg-white text-red-600 px-4 py-2 rounded-full font-semibold flex items-center space-x-2 hover:bg-gray-200 transition-colors'
                      >
                        <ShoppingCart size={16} />
                        <span>Ajouter</span>
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
                      Ajouter au panier
                    </button>
                  )}
                </>
              ) : (
                <span className='text-red-500 font-bold text-lg'>
                  Rupture de stock
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
