// frontend/src/pages/CartPage.jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useTranslation } from 'react-i18next'

// Import des images locales (inchangé)
import btn6 from '../../assets/images/btn6.png'
import btn125 from '../../assets/images/btn12.5.png'
import btn50 from '../../assets/images/btn50.png'
import vitrer from '../../assets/images/vitrer.png'
import classic from '../../assets/images/classic.png'
import detenteur from '../../assets/images/detenteur.png'
import detenteur2 from '../../assets/images/detenteur2.png'
import tuyo from '../../assets/images/tuyo.png'
import bruleur from '../../assets/images/bruleur.png'

// Carte fichier → image (inchangé)
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

// Constante pour le backend URL (à adapter si nécessaire)
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
  
  // ✅ NOUVEL ÉTAT : Gérer le statut du paiement en ligne
  const [paymentStatus, setPaymentStatus] = useState({ state: 'idle', message: '' }) 

  // Charger produits depuis API (inchangé)
  const [allProducts, setAllProducts] = useState([])
  useEffect(() => {
    // ... (Logique fetchProducts inchangée) ...
    const fetchProducts = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/api/products`);
          if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
          const data = await response.json();
          setAllProducts(data);
        } catch (err) {
          console.error('Erreur chargement produits:', err);
        }
      };
      fetchProducts();
  }, [])
  // ... (Fonctions getPriceValue, cartItems, calculateTotal, handleRemoveItem inchangées) ...

  const getPriceValue = (price) => {
    if (typeof price === 'string') {
      return parseFloat(price.replace(/[^\d]/g, '')) || 0
    }
    if (typeof price === 'number') return price
    return 0
  }

  // Construire items panier (simplifié pour la clarté)
  const cartItems = Object.keys(cart || {})
    .map((cartId) => {
      const [productId, priceType] = cartId.split('-')
      const product = allProducts.find((p) => p.id === productId)
      if (!product) return null
      
      let itemPrice = 0
      if (product.isGasBottle) {
          if (priceType === 'full') {
              itemPrice = getPriceValue(product.fullPrice)
          } else if (priceType === 'empty') {
              itemPrice = getPriceValue(product.emptyPrice)
          } else {
              itemPrice = getPriceValue(product.price)
          }
      } else {
          itemPrice = getPriceValue(product.price)
      }
      
      return {
          ...product,
          id: cartId,
          quantity: cart[cartId].quantity,
          price: itemPrice,
          name: product.name, // Nom non traduit ici pour simplifier
      }
    })
    .filter((item) => item !== null)
    
  const calculateTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    
  const handleRemoveItem = (id) => {
    handleUpdateCart(id, -cart[id].quantity)
  }
  
  // Fonction de polling pour vérifier le statut du paiement
  const pollPaymentStatus = (reference) => {
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/api/payments/verify/${reference}`);
          const data = await response.json();

          if (data.status === 'complete') {
            clearInterval(interval);
            resolve('complete');
          } else if (data.status === 'failed' || data.status === 'canceled') {
            clearInterval(interval);
            resolve('failed');
          } else {
            // Statut 'pending', continuer le polling
            setPaymentStatus({ 
                state: 'pending', 
                message: t("Confirmation en cours. Veuillez valider la demande sur votre téléphone") 
            });
          }
        } catch (error) {
          console.error("Erreur lors du polling:", error);
          clearInterval(interval);
          resolve('error');
        }
      }, 5000); // Vérifie toutes les 5 secondes

      // Arrêter le polling après un certain délai (ex: 5 minutes = 300000 ms)
      setTimeout(() => {
        clearInterval(interval);
        if (paymentStatus.state === 'pending') {
            resolve('timeout');
        }
      }, 300000); 
    });
  };


  // ✅ MISE À JOUR : Validation de la commande
  const handleValidateOrder = async () => {
    // ... (Validations inchangées) ...
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


    const orderPayload = {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryDate,
      paymentMethod,
      items: cartItems.map((item) => ({
        productId: item.id.split('-')[0],
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      totalAmount: calculateTotal(),
    }
    
    setPaymentStatus({ state: 'loading', message: '' }); // Début du processus

    try {
      // 1. Créer la commande dans votre base de données (étape nécessaire pour obtenir un orderId)
      const orderResponse = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })
      const orderData = await orderResponse.json()
      const orderId = orderData.id;

      // Paiement à la livraison
      if (paymentMethod === 'cash') {
        emptyCart()
        navigate('/order-confirmation', {
          state: { orderDetails: { ...orderPayload, orderId: orderId, paymentStatus: 'CASH_ON_DELIVERY' } },
        })
        return;
      } 
      
      // 2. Paiements Mobile Money / Carte (NotchPay)
      
      // ✅ Adaptation du paymentMethod pour NotchPay
      let notchPaymentMethod = '';
      if (paymentMethod === 'mtn-momo') {
        notchPaymentMethod = 'momo.mtn';
      } else if (paymentMethod === 'orange-money') {
        notchPaymentMethod = 'momo.orange';
      } else if (paymentMethod === 'card') {
        notchPaymentMethod = 'card';
      } else {
        throw new Error(t('Méthode de paiement en ligne non supportée.'));
      }


      const paymentPayload = {
        amount: calculateTotal(),
        phone: customerPhone,
        email: customerEmail,
        orderId: orderId,
        paymentMethod: notchPaymentMethod, // ✅ On envoie le format NotchPay
      }

      setPaymentStatus({ state: 'processing', message: t('Initialisation du paiement en cours...') });
      
      // 3. Initialiser la transaction NotchPay (sur votre backend /payments)
      const paymentResponse = await fetch(
        `${BACKEND_URL}/api/payments/initialize`, // L'endpoint que vous avez adapté pour POST /payments
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentPayload),
        }
      )
      const paymentData = await paymentResponse.json()

      if (!paymentResponse.ok || !paymentData.reference) {
          throw new Error(paymentData.message || t("Échec de l'initialisation du paiement."))
      }
      
      const transactionReference = paymentData.reference;

      // CAS 1: Mobile Money Direct (USSD Push)
      if (notchPaymentMethod === 'momo.mtn' || notchPaymentMethod === 'momo.orange') {
          
          setPaymentStatus({ 
              state: 'pending', 
              message: t("Demande envoyée ! Veuillez confirmer le paiement sur votre téléphone mobile.") 
          });

          // Démarrer le polling
          const finalStatus = await pollPaymentStatus(transactionReference);

          if (finalStatus === 'complete') {
            setPaymentStatus({ state: 'success', message: t('Paiement confirmé ! Redirection en cours...') });
            emptyCart();
            navigate('/order-confirmation', { state: { orderDetails: { ...orderPayload, orderId, paymentStatus: 'COMPLETE' } } });
          } else if (finalStatus === 'failed' || finalStatus === 'canceled' || finalStatus === 'timeout') {
            setPaymentStatus({ 
                state: 'error', 
                message: t("Le paiement a échoué ou a expiré. Veuillez réessayer.") 
            });
          }
          
      } 
      // CAS 2: Redirection (Carte Bancaire)
      else if (paymentData.authorization_url) {
          setPaymentStatus({ state: 'redirect', message: t('Redirection vers la plateforme de paiement...') });
          emptyCart() // Vider le panier avant de quitter
          window.location.href = paymentData.authorization_url
      } else {
          // Si on n'a ni USSD push ni URL de redirection, c'est une erreur inattendue.
          throw new Error(t("Le système de paiement a renvoyé une réponse inattendue."));
      }
      
    } catch (err) {
      console.error('❌ Erreur commande/paiement:', err)
      setPaymentStatus({ state: 'error', message: err.message || t("Une erreur fatale est survenue.") });
    } finally {
        // En cas d'erreur ou de succès du cash, on réinitialise l'état
        if (paymentMethod === 'cash' || paymentStatus.state === 'success' || paymentStatus.state === 'error') {
            // On ne réinitialise pas si on est en "pending" pour laisser le polling continuer
            if(paymentStatus.state !== 'pending') {
                // setPaymentStatus({ state: 'idle', message: '' }); 
                // Laisser le message d'erreur/succès affiché jusqu'à ce que l'utilisateur recharge/quitte
            }
        }
    }
  }

  const getTomorrowDate = () => {
    const today = new Date()
    today.setDate(today.getDate() + 1)
    return today.toISOString().split('T')[0]
  }

  // Fonction pour déterminer si le bouton de validation doit être désactivé
  const isValidationDisabled = cartItems.length === 0 || paymentStatus.state === 'loading' || paymentStatus.state === 'processing' || paymentStatus.state === 'pending' || paymentStatus.state === 'redirect';


  return (
    <motion.div
      className='bg-gray-50 min-h-screen pt-24 pb-16'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className='container mx-auto px-4'>
        {/* ... (En-tête inchangé) ... */}
        <div className='flex items-center justify-between mb-8'>
          <h1 className='text-4xl font-extrabold text-gray-800'>
            {t('Votre Panier')}
          </h1>
          <motion.button
            onClick={() => navigate('/products')}
            className='flex items-center text-red-600 font-semibold hover:text-red-700'
            whileHover={{ x: -5 }}
          >
            <ArrowLeft size={20} className='mr-2' />
            {t('Continuer mes achats')}
          </motion.button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Liste panier (inchangée) */}
          <div className='lg:col-span-2 bg-white rounded-2xl shadow-xl p-8'>
            <h2 className='text-2xl font-bold mb-6 border-b pb-4'>
              {t('Récapitulatif de votre commande')}
            </h2>
            <div className='space-y-6'>
              {/* ... (Affichage des articles du panier inchangé) ... */}
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <motion.div key={item.id} className='flex items-center border-b pb-4' initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                    {/* ... (détails de l'article) ... */}
                    <img src={imageMap[item.image]} alt={item.name} className='w-20 h-20 object-contain rounded-lg mr-4'/>
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
                        <button onClick={() => handleUpdateCart(item.id, -1)} className='bg-gray-200 p-1 rounded-full' disabled={item.quantity <= 1}><Minus size={16} /></button>
                        <span className='font-bold'>{item.quantity}</span>
                        <button onClick={() => handleUpdateCart(item.id, 1)} className='bg-gray-200 p-1 rounded-full'><Plus size={16} /></button>
                      </div>
                      <button onClick={() => handleRemoveItem(item.id)} className='text-red-500 hover:text-red-700 mt-2'><Trash2 size={20} /></button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className='text-center text-gray-500'>
                  {t('Votre panier est vide.')}
                </p>
              )}
            </div>
          </div>

          {/* Formulaire client */}
          <div className='bg-white rounded-2xl shadow-xl p-8'>
            <h2 className='text-2xl font-bold mb-6 border-b pb-4'>
              {t('Informations client et livraison')}
            </h2>
            <div className='space-y-4'>
              {/* ... (Champs de formulaire client/livraison inchangés) ... */}
              <input type='text' value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t('Votre nom complet')} className='w-full p-2 border rounded-md'/>
              <input type='email' value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder={t('Votre email')} className='w-full p-2 border rounded-md'/>
              <input type='tel' value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder={t('Votre numéro de téléphone')} className='w-full p-2 border rounded-md'/>
              <input type='date' value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} min={getTomorrowDate()} className='w-full p-2 border rounded-md'/>
              <input type='text' value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder={t('Adresse de livraison')} className='w-full p-2 border rounded-md'/>
              <textarea value={deliveryDetails} onChange={(e) => setDeliveryDetails(e.target.value)} placeholder={t('Détails supplémentaires (optionnel)')} className='w-full p-2 border rounded-md'/>

              {/* Choix méthode paiement (inchangé) */}
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className='w-full p-2 border rounded-md'>
                <option value='cash'>💵 {t('Paiement à la livraison')}</option>
                <option value='orange-money'>📱 {t('Orange Money')}</option>
                <option value='mtn-momo'>📱 {t('MTN Mobile Money')}</option>
                <option value='card'>💳 {t('Carte Bancaire')}</option>
              </select>
            </div>
            
            {/* ✅ AJOUT : Affichage du statut de paiement */}
            {paymentStatus.state !== 'idle' && paymentStatus.message && (
                <div className={`mt-4 p-3 rounded-lg font-medium ${
                    paymentStatus.state === 'pending' || paymentStatus.state === 'processing'
                        ? 'bg-yellow-100 text-yellow-700 animate-pulse'
                        : paymentStatus.state === 'success' || paymentStatus.state === 'redirect'
                        ? 'bg-green-100 text-green-700'
                        : paymentStatus.state === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                }`}>
                    {paymentStatus.message}
                </div>
            )}

            <div className='mt-6'>
              <h3 className='text-2xl font-bold'>
                {t('Total de la commande')}
              </h3>
              <p className='text-4xl font-extrabold text-red-600'>
                {calculateTotal().toLocaleString('fr-CM')} Fcfa
              </p>
              <motion.button
                onClick={handleValidateOrder}
                className='w-full mt-6 bg-red-600 text-white font-bold py-3 px-6 rounded-full disabled:opacity-50'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isValidationDisabled} // 👈 Utilisation du nouveau statut
              >
                {paymentStatus.state === 'pending' 
                  ? t('En attente de confirmation...') 
                  : paymentStatus.state === 'processing' || paymentStatus.state === 'loading'
                  ? t('Initialisation...')
                  : t('Valider la commande')}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CartPage