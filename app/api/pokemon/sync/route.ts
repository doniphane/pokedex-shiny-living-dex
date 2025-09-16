import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface PokemonAPIResponse {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number
  types: Array<{
    slot: number
    type: {
      name: string
      url: string
    }
  }>
  abilities: Array<{
    ability: {
      name: string
      url: string
    }
    is_hidden: boolean
    slot: number
  }>
  stats: Array<{
    base_stat: number
    effort: number
    stat: {
      name: string
      url: string
    }
  }>
  sprites: {
    front_default: string
    front_shiny: string
    other: {
      'official-artwork': {
        front_default: string
        front_shiny: string
      }
    }
  }
}

interface GenerationAPIResponse {
  pokemon_species: Array<{
    name: string
    url: string
  }>
}

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

async function fetchPokemonData(id: number): Promise<PokemonAPIResponse | null> {
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

function getGenerationFromId(id: number): number {
  for (const [gen, range] of Object.entries(GENERATION_RANGES)) {
    if (id >= range.start && id <= range.end) {
      return parseInt(gen)
    }
  }
  return 1 // Default to generation 1
}

export async function POST(request: NextRequest) {
  try {
    const { generation } = await request.json()

    if (!generation || generation < 1 || generation > 9) {
      return NextResponse.json(
        { error: 'Generation must be between 1 and 9' },
        { status: 400 }
      )
    }

    const range = GENERATION_RANGES[generation as keyof typeof GENERATION_RANGES]
    const pokemonData = []

    console.log(`Syncing generation ${generation} (Pokemon ${range.start}-${range.end})...`)

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

        // Upsert Pokemon data
        await prisma.pokemon.upsert({
          where: { id: pokemon.id },
          update: pokemonToSave,
          create: pokemonToSave
        })

        pokemonData.push(pokemonToSave)
        console.log(`Synced Pokemon ${pokemon.name} (${pokemon.id})`)
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${pokemonData.length} Pokemon from generation ${generation}`,
      count: pokemonData.length
    })

  } catch (error) {
    console.error('Error syncing Pokemon data:', error)
    return NextResponse.json(
      { error: 'Error syncing Pokemon data' },
      { status: 500 }
    )
  }
}

// Sync all generations
export async function GET() {
  try {
    const results = []

    for (let gen = 1; gen <= 9; gen++) {
      const range = GENERATION_RANGES[gen as keyof typeof GENERATION_RANGES]
      let count = 0

      console.log(`Syncing generation ${gen} (Pokemon ${range.start}-${range.end})...`)

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
          console.log(`Synced Pokemon ${pokemon.name} (${pokemon.id})`)
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      results.push({
        generation: gen,
        count,
        range: `${range.start}-${range.end}`
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully synced all Pokemon generations',
      results
    })

  } catch (error) {
    console.error('Error syncing all Pokemon data:', error)
    return NextResponse.json(
      { error: 'Error syncing Pokemon data' },
      { status: 500 }
    )
  }
}