const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const GENERATION_RANGES = {
  1: { start: 1, end: 151 },
  2: { start: 152, end: 251 },
  3: { start: 252, end: 386 },
  4: { start: 387, end: 493 },
  5: { start: 494, end: 649 },
  6: { start: 650, end: 721 },
  7: { start: 722, end: 809 },
  8: { start: 810, end: 905 },
  9: { start: 906, end: 1025 }
}

async function fetchPokemonData(id) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    if (!response.ok) {
      console.log(`Pokemon ${id} not found`)
      return null
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching Pokemon ${id}:`, error)
    return null
  }
}

function getGenerationFromId(id) {
  for (const [gen, range] of Object.entries(GENERATION_RANGES)) {
    if (id >= range.start && id <= range.end) {
      return parseInt(gen)
    }
  }
  return 1 // Default to generation 1
}

async function syncGeneration(generation) {
  const range = GENERATION_RANGES[generation]
  let count = 0

  console.log(`\n🔄 Syncing generation ${generation} (Pokemon ${range.start}-${range.end})...`)

  for (let id = range.start; id <= range.end; id++) {
    const pokemon = await fetchPokemonData(id)
    if (pokemon) {
      const pokemonToSave = {
        id: pokemon.id,
        name: pokemon.name,
        height: pokemon.height,
        weight: pokemon.weight,
        baseExp: pokemon.base_experience || 0,
        types: pokemon.types,
        abilities: pokemon.abilities,
        stats: pokemon.stats,
        sprites: pokemon.sprites,
        generation: getGenerationFromId(pokemon.id)
      }

      await prisma.pokemon.upsert({
        where: { id: pokemon.id },
        update: pokemonToSave,
        create: pokemonToSave
      })

      count++
      console.log(`✅ Synced Pokemon ${pokemon.name} (${pokemon.id})`)
    }

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`✨ Generation ${generation} completed: ${count} Pokemon synced`)
  return count
}

async function syncAllGenerations() {
  console.log('🚀 Starting Pokemon data synchronization...')

  const results = []
  let totalCount = 0

  for (let gen = 1; gen <= 9; gen++) {
    const count = await syncGeneration(gen)
    results.push({
      generation: gen,
      count,
      range: `${GENERATION_RANGES[gen].start}-${GENERATION_RANGES[gen].end}`
    })
    totalCount += count
  }

  console.log('\n📊 Synchronization Summary:')
  results.forEach(result => {
    console.log(`   Generation ${result.generation}: ${result.count} Pokemon (${result.range})`)
  })
  console.log(`\n🎉 Total: ${totalCount} Pokemon synced across all generations`)
}

async function main() {
  try {
    await syncAllGenerations()
  } catch (error) {
    console.error('❌ Error during synchronization:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()