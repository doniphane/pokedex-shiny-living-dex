const { PrismaClient } = require('@prisma/client')

// Validation des variables d'environnement requises
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET'
]

console.log('🔍 Validation de l\'environnement de production...\n')

// Vérifier les variables d'environnement
const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.log('❌ Variables d\'environnement manquantes:')
  missingVars.forEach(varName => console.log(`   - ${varName}`))
  process.exit(1)
}

console.log('✅ Variables d\'environnement: OK')

// Test de connexion à la base de données
async function testDatabaseConnection() {
  const prisma = new PrismaClient()

  try {
    console.log('🔄 Test de connexion à la base de données...')

    // Test de connexion
    await prisma.$connect()
    console.log('✅ Connexion DB: OK')

    // Test de requête simple
    const pokemonCount = await prisma.pokemon.count()
    console.log(`✅ Données Pokemon: ${pokemonCount} entrées`)

    // Test des tables principales
    const userCount = await prisma.user.count()
    console.log(`✅ Table users: ${userCount} entrées`)

    const capturedCount = await prisma.capturedPokemon.count()
    console.log(`✅ Table captured_pokemon: ${capturedCount} entrées`)

    console.log('\n🎉 Environnement prêt pour le déploiement!')

  } catch (error) {
    console.log('❌ Erreur de base de données:', error.message)
    console.log('\n📋 Points à vérifier:')
    console.log('   1. PostgreSQL est-il démarré sur votre serveur?')
    console.log('   2. Le port 5432 est-il ouvert?')
    console.log('   3. Les identifiants dans DATABASE_URL sont-ils corrects?')
    console.log('   4. pg_hba.conf autorise-t-il les connexions externes?')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabaseConnection()