
// src/data/productsData.js
import btn6 from '../assets/images/btn6.png'
import btn125 from '../assets/images/btn12.5.png'
import btn50 from '../assets/images/btn50.png'
import vitrer from '../assets/images/vitrer.png'
import classic from '../assets/images/classic.png'
import detenteur from '../assets/images/detenteur.png'
import detenteur2 from '../assets/images/detenteur2.png'
import tuyo from '../assets/images/tuyo.png'
import bruleur from '../assets/images/bruleur.png'

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
    description: 'Bouteille robuste contenant 12,5 kg de GPL.',
    fullPrice: 26500,
    emptyPrice: 6500,
    isGasBottle: true,
    inStock: true,
  },
  {
    id: 'prod03',
    name: 'Bouteille de gaz 50 kg',
    image: btn50,
    description: 'Grande bouteille de 50 kg pour usages intensifs.',
    fullPrice: 76000,
    emptyPrice: 26000,
    isGasBottle: true,
    inStock: true,
  },
  {
    id: 'prod04',
    name: 'Plaque à gaz en verre',
    image: vitrer,
    description: 'Table de cuisson moderne en verre trempé.',
    price: 18000,
    isGasBottle: false,
    inStock: true,
  },
  {
    id: 'prod05',
    name: 'Plaque à gaz en acier',
    image: classic,
    description: 'Table de cuisson robuste et économique.',
    price: 16000,
    isGasBottle: false,
    inStock: true,
  },
  {
    id: 'prod06',
    name: 'Détendeur pour bouteille 12,5 kg',
    image: detenteur,
    description: 'Régulateur de pression pour bouteilles 12,5 kg.',
    price: 3000,
    isGasBottle: false,
    inStock: true,
  },
  {
    id: 'prod07',
    name: 'Détendeur pour bouteille 6 kg',
    image: detenteur2,
    description: 'Détendeur conçu pour bouteilles 6 kg à valve.',
    price: 3000,
    isGasBottle: false,
    inStock: true,
  },
  {
    id: 'prod08',
    name: 'Tuyau de gaz',
    image: tuyo,
    description: 'Tuyau pour relier bouteille et appareil.',
    price: 2000,
    isGasBottle: false,
    inStock: true,
  },
  {
    id: 'prod09',
    name: 'Brûleur vissable pour bouteille 6 kg',
    image: bruleur,
    description: 'Brûleur à fixer directement sur la valve.',
    price: 1500,
    isGasBottle: false,
    inStock: false,
  },
]
export default productsData