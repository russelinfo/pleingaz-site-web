import NotchPay from 'notchpay.js'
import dotenv from 'dotenv'
dotenv.config()

if (!process.env.NOTCH_PUBLIC_KEY || !process.env.NOTCH_PRIVATE_KEY) {
  console.warn('⚠️ NOTCH keys not set in .env')
}

// Initialise la bibliothèque avec la clé publique ET la clé privée pour l'authentification
export const notchpay = NotchPay(process.env.NOTCH_PUBLIC_KEY, {
  debug: process.env.NODE_ENV !== 'production',
  authorization: `Bearer ${process.env.NOTCH_PRIVATE_KEY}`,
})
