// src//products.js (Nouveau fichier unifié)

const products = [
  {
   id : "prod01",
    name: 'Bouteille de gaz 6 kg',
    image: 'btn6.png',
    description:
      'Bouteille en acier robuste, livrée pleine de 6 kg de GPL. Idéale pour petites familles et usages occasionnels. Cette bouteille à valve est facile à transporter et à utiliser pour tous vos besoins en cuisson et chauffage.',
    shortDescription:
      'Bouteille en acier robuste, livrée pleine de 6 kg de GPL.',
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
   id : "prod02",
    name: 'Bouteille de gaz 12,5 kg',
    image: 'btn12.5.png',
    description:
      'Bouteille robuste contenant 12,5 kg de GPL. Adaptée aux besoins domestiques réguliers, elle offre une autonomie prolongée pour la cuisine et les appareils domestiques.',
    shortDescription: 'Bouteille robuste contenant 12,5 kg de GPL.',
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
   id : "prod03",
    name: 'Bouteille de gaz 50 kg',
    image: 'btn50.png',
    description:
      'Grande bouteille de 50 kg pour usages intensifs. Idéale pour restaurants, hôtels et industries. Son robinet de haute sécurité garantit une utilisation sans risque pour les professionnels.',
    shortDescription: 'Grande bouteille de 50 kg pour usages intensifs.',
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
   id : "prod04",
    name: 'Plaque à gaz en verre',
    image: 'vitrer.png',
    description:
      'Table de cuisson PLEINGAZ moderne en verre trempé. Élégante, résistante à la chaleur et facile à nettoyer, elle s’intègre parfaitement dans les cuisines contemporaines.',
    shortDescription: 'Table de cuisson moderne en verre trempé.',
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
   id : "prod05",
    name: 'Plaque à gaz en acier',
    image: 'classic.png',
    description:
      'Table de cuisson robuste et économique. Adaptée aux usages domestiques quotidiens, sa conception durable en acier la rend résistante et facile d’entretien.',
    shortDescription: 'Table de cuisson robuste et économique.',
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
   id : "prod06",
    name: 'Détendeur pour bouteille 12,5 kg',
    image: 'detenteur.png',
    description:
      'Régulateur de pression pour bouteilles 12,5 kg à robinet. Cet accessoire garantit une sécurité et une régulation optimale de votre flux de gaz pour un usage domestique sans souci.',
    shortDescription: 'Régulateur de pression pour bouteilles 12,5 kg.',
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
   id : "prod07",
    name: 'Détendeur pour bouteille 6 kg',
    image: 'detenteur2.png',
    description:
      'Détendeur PLEINGAZ conçu pour bouteilles 6 kg à valve. Simple à visser, sûr et pratique, il est l’accessoire indispensable pour votre petite bouteille',
    shortDescription: 'Détendeur conçu pour bouteilles 6 kg à valve.',
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
   id : "prod08",
    name: 'Tuyau de gaz',
    image: 'tuyo.png',
    description:
      'Tuyau pour relier bouteille et appareil. Fabriqué en matériau résistant à la pression, il garantit une alimentation en gaz sûre et durable. (Longueur standard : 1.5 m)',
    shortDescription: 'Tuyau pour relier bouteille et appareil.',
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
   id : "prod09",
    name: 'Brûleur vissable pour bouteille 6 kg',
    image: 'bruleur.png',
    description:
      'Brûleur à fixer directement sur la valve de votre bouteille de 6 kg. C’est une solution simple et mobile, idéale pour la cuisson en extérieur, en camping ou pour les petits espaces.',
    shortDescription: 'Brûleur à fixer directement sur la valve.',
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

export default products
