// Fichier : prisma/seed.js

import { PrismaClient } from '@prisma/client'
// ⚠️ Supprimez cette ligne : import products from '../data/product.js' ⚠️

const prisma = new PrismaClient()

async function main() {
  // 1. UTILISEZ L'IMPORTATION DYNAMIQUE AVEC AWAIT
  // Ceci charge le module et extrait la clé 'default' qui contient votre tableau 'products'.
  const { default: products } = await import('../data/product.js')

  console.log('🚀 Insertion des produits dans la base...')
  console.log(`Produits à insérer : ${products.length} articles trouvés.`)
  // Ce log confirmera que les données ont été lues !

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        // Champs à mettre à jour si le produit existe
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription || null,
        image: product.image,
        fullPrice: product.fullPrice || null,
        emptyPrice: product.emptyPrice || null,
        price: product.price || null,
        isGasBottle: product.isGasBottle,
        inStock: product.inStock,
      },
      create: {
        // Champs pour la création si le produit n'existe pas
        id: product.id,
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription || null,
        image: product.image,
        fullPrice: product.fullPrice || null,
        emptyPrice: product.emptyPrice || null,
        price: product.price || null,
        isGasBottle: product.isGasBottle,
        inStock: product.inStock,
      },
    })
  }

  console.log('✅ Produits insérés avec succès !')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
