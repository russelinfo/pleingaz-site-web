// prismaClient.js
import { PrismaClient } from '@prisma/client'

// Debug pour voir l'état du client
console.log('🔍 Initialisation Prisma Client...')
console.log('- DATABASE_URL présente:', !!process.env.DATABASE_URL)
console.log('- NODE_ENV:', process.env.NODE_ENV)

let prisma

try {
  prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

  console.log('✅ Prisma Client créé avec succès')

  // Test de connexion
  await prisma.$connect()
  console.log('✅ Connexion à la base de données établie')
} catch (error) {
  console.error("❌ Erreur lors de l'initialisation de Prisma:", error)
  process.exit(1)
}

// Gérer la fermeture propre
process.on('beforeExit', async () => {
  console.log('🔌 Fermeture de la connexion Prisma...')
  await prisma.$disconnect()
})

export default prisma
