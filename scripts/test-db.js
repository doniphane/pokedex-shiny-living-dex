const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabase() {
  try {
    console.log('🔄 Testing database connection...')

    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!')

    // Count Pokemon
    const pokemonCount = await prisma.pokemon.count()
    console.log(`📊 Total Pokemon in database: ${pokemonCount}`)

    // Test first few Pokemon
    const firstPokemon = await prisma.pokemon.findMany({
      take: 5,
      orderBy: { id: 'asc' }
    })

    console.log('\n🎯 First 5 Pokemon:')
    firstPokemon.forEach(p => {
      console.log(`  #${p.id} - ${p.name} (Gen ${p.generation})`)
    })

    // Test by generation
    const gen1Count = await prisma.pokemon.count({
      where: { generation: 1 }
    })
    console.log(`\n📈 Generation 1 Pokemon: ${gen1Count}`)

    // Test API endpoint
    console.log('\n🌐 Testing API endpoint...')
    const response = await fetch('http://localhost:3000/api/pokemon?limit=5')
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ API returned ${data.pokemon?.length || 0} Pokemon`)
    } else {
      console.log('❌ API endpoint not reachable (server not running?)')
    }

  } catch (error) {
    console.error('❌ Database test failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()