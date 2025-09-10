// src/pages/nos service/ProductDetail.jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, ArrowLeft, ShoppingCart } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'

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

// Liste des produits (réutilisée et complétée)
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
          const product = productsData.find((p) => p.id === id)

          // Gère le cas où le produit n'est pas trouvé
          useEffect(() => {
            if (!product) {
              navigate('/products')
            }
          }, [product, navigate])

          const [quantity, setQuantity] = useState(0)

          const handleUpdateCart = (change) => {
            const newQuantity = Math.max(0, quantity + change)
            setQuantity(newQuantity)
          }

          if (!product) {
            return null // Retourne null pour éviter d'afficher le reste du composant
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
                {/* Bouton de retour */}
                <motion.button
                  onClick={() => navigate(-1)}
                  className='flex items-center text-red-600 font-semibold mb-8 hover:text-red-700 transition-colors'
                  whileHover={{ x: -5 }}
                >
                  <ArrowLeft size={20} className='mr-2' />
                  Retour à la liste des produits
                </motion.button>

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
                    <p className='text-gray-600 text-sm mb-4'>
                     
                    </p>

                    <p className='text-lg text-gray-700 leading-relaxed mb-6'>
                      {product.description}
                    </p>

                    {/* Prix */}
                    <div className='mb-6'>
                      {product.isGasBottle ? (
                        <div>
                          <span className='font-bold text-red-600 text-lg'>
                            Prix Bouteille + Gaz :
                          </span>
                          <span className='ml-2 text-2xl font-bold text-red-600'>
                            {product.fullPrice.toLocaleString('fr-CM')} Fcfa
                          </span>
                          <br />
                          <span className='font-bold text-gray-600 text-sm'>
                            Prix Gaz seul :
                          </span>
                          <span className='ml-2 text-lg font-bold text-gray-600'>
                            {product.emptyPrice.toLocaleString('fr-CM')} Fcfa
                          </span>
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

                    {/* Contrôles de quantité et statut de stock */}
                    <div className='flex items-center space-x-4'>
                      {product.inStock ? (
                        <>
                          <div className='flex items-center border border-gray-300 rounded-full px-2 py-1 space-x-2'>
                            <button
                              onClick={() => handleUpdateCart(-1)}
                              className='text-red-600 p-1 hover:bg-gray-200 rounded-full disabled:opacity-50'
                              disabled={quantity <= 0}
                            >
                              <Minus size={20} />
                            </button>
                            <span className='font-bold w-6 text-center text-xl'>
                              {quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateCart(1)}
                              className='text-red-600 p-1 hover:bg-gray-200 rounded-full'
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                          <button className='flex items-center space-x-2 bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-red-700 transition-colors'>
                            <ShoppingCart size={20} />
                            <span>Ajouter au panier</span>
                          </button>
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
