// prisma/seed.js
import { PrismaClient } from '@prisma/client'
import products from '../data/product.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Insertion des produits dans la base...')

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id }, // Utilise l'ID unique pour la recherche
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
