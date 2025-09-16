import { prisma } from '@/lib/db'

interface PokemonGeneration {
  id: number
  name: string
  range: [number, number]
}

export const POKEMON_GENERATIONS: PokemonGeneration[] = [
  { id: 1, name: "Kanto", range: [1, 151] },
  { id: 2, name: "Johto", range: [152, 251] },
  { id: 3, name: "Hoenn", range: [252, 386] },
  { id: 4, name: "Sinnoh", range: [387, 493] },
  { id: 5, name: "Unova", range: [494, 649] },
  { id: 6, name: "Kalos", range: [650, 721] },
  { id: 7, name: "Alola", range: [722, 809] },
  { id: 8, name: "Galar", range: [810, 905] },
  { id: 9, name: "Paldea", range: [906, 1025] }
]

export const TOTAL_POKEMON = 1025

export interface PokemonType {
  slot: number
  type: {
    name: string
    url: string
  }
}

export interface PokemonSprites {
  front_default: string | null
  front_shiny: string | null
  other: {
    "official-artwork": {
      front_default: string | null
      front_shiny: string | null
    }
    home: {
      front_default: string | null
      front_shiny: string | null
    }
    showdown: {
      front_default: string | null
      front_shiny: string | null
    }
  }
}

export interface Pokemon {
  id: number
  name: string
  frenchName?: string
  height: number
  weight: number
  base_experience: number
  baseExp?: number // Alias for compatibility
  types: PokemonType[]
  sprites: PokemonSprites
  stats: Array<{
    base_stat: number
    stat: {
      name: string
    }
  }>
  abilities: Array<{
    ability: {
      name: string
    }
    is_hidden: boolean
  }>
  species?: {
    name: string
    url: string
  }
  generation?: number
  isShiny?: boolean
}

class PokemonDBService {
  async getPokemon(id: number): Promise<Pokemon> {
    const pokemon = await prisma.pokemon.findUnique({
      where: { id }
    })

    if (!pokemon) {
      throw new Error(`Pokemon with ID ${id} not found`)
    }

    // Transform database format to API format
    return {
      id: pokemon.id,
      name: pokemon.name,
      height: pokemon.height,
      weight: pokemon.weight,
      base_experience: pokemon.baseExp,
      baseExp: pokemon.baseExp,
      types: pokemon.types as unknown as PokemonType[],
      sprites: pokemon.sprites as unknown as PokemonSprites,
      stats: pokemon.stats as any[],
      abilities: pokemon.abilities as any[],
      generation: pokemon.generation,
      species: {
        name: pokemon.name,
        url: `https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}/`
      }
    }
  }

  async getPokemonBatch(ids: number[]): Promise<Pokemon[]> {
    const pokemon = await prisma.pokemon.findMany({
      where: {
        id: {
          in: ids
        }
      },
      orderBy: { id: 'asc' }
    })

    return pokemon.map(p => ({
      id: p.id,
      name: p.name,
      height: p.height,
      weight: p.weight,
      base_experience: p.baseExp,
      baseExp: p.baseExp,
      types: p.types as unknown as PokemonType[],
      sprites: p.sprites as unknown as PokemonSprites,
      stats: p.stats as any[],
      abilities: p.abilities as any[],
      generation: p.generation,
      species: {
        name: p.name,
        url: `https://pokeapi.co/api/v2/pokemon-species/${p.id}/`
      }
    }))
  }

  async getAllPokemon(options: {
    generations?: number[]
    limit?: number
    offset?: number
    search?: string
  } = {}): Promise<Pokemon[]> {
    const { generations, limit = 50, offset = 0, search } = options

    const where: any = {}

    if (generations && generations.length > 0) {
      where.generation = {
        in: generations
      }
    }

    if (search) {
      where.name = {
        contains: search.toLowerCase(),
        mode: 'insensitive'
      }
    }

    const pokemon = await prisma.pokemon.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { id: 'asc' }
    })

    return pokemon.map(p => ({
      id: p.id,
      name: p.name,
      height: p.height,
      weight: p.weight,
      base_experience: p.baseExp,
      baseExp: p.baseExp,
      types: p.types as unknown as PokemonType[],
      sprites: p.sprites as unknown as PokemonSprites,
      stats: p.stats as any[],
      abilities: p.abilities as any[],
      generation: p.generation,
      species: {
        name: p.name,
        url: `https://pokeapi.co/api/v2/pokemon-species/${p.id}/`
      }
    }))
  }

  async getPokemonByGeneration(generation: number, options: {
    limit?: number
    offset?: number
    search?: string
  } = {}): Promise<Pokemon[]> {
    const { limit = 50, offset = 0, search } = options

    const where: any = { generation }

    if (search) {
      where.name = {
        contains: search.toLowerCase(),
        mode: 'insensitive'
      }
    }

    const pokemon = await prisma.pokemon.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { id: 'asc' }
    })

    return pokemon.map(p => ({
      id: p.id,
      name: p.name,
      height: p.height,
      weight: p.weight,
      base_experience: p.baseExp,
      baseExp: p.baseExp,
      types: p.types as unknown as PokemonType[],
      sprites: p.sprites as unknown as PokemonSprites,
      stats: p.stats as any[],
      abilities: p.abilities as any[],
      generation: p.generation,
      species: {
        name: p.name,
        url: `https://pokeapi.co/api/v2/pokemon-species/${p.id}/`
      }
    }))
  }

  async searchPokemon(query: string): Promise<Pokemon[]> {
    // Search by ID if it's a number
    const id = parseInt(query)
    if (!isNaN(id) && id >= 1 && id <= TOTAL_POKEMON) {
      try {
        const pokemon = await this.getPokemon(id)
        return [pokemon]
      } catch {
        return []
      }
    }

    // Search by name
    const pokemon = await prisma.pokemon.findMany({
      where: {
        name: {
          contains: query.toLowerCase(),
          mode: 'insensitive'
        }
      },
      orderBy: { id: 'asc' },
      take: 10
    })

    return pokemon.map(p => ({
      id: p.id,
      name: p.name,
      height: p.height,
      weight: p.weight,
      base_experience: p.baseExp,
      baseExp: p.baseExp,
      types: p.types as unknown as PokemonType[],
      sprites: p.sprites as unknown as PokemonSprites,
      stats: p.stats as any[],
      abilities: p.abilities as any[],
      generation: p.generation,
      species: {
        name: p.name,
        url: `https://pokeapi.co/api/v2/pokemon-species/${p.id}/`
      }
    }))
  }

  async getPokemonByType(typeName: string): Promise<number[]> {
    // Use raw SQL for JSON array search in PostgreSQL
    const results = await prisma.$queryRaw<Array<{id: number}>>`
      SELECT id FROM pokemon
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements(types) AS t
        WHERE t->'type'->>'name' = ${typeName.toLowerCase()}
      )
      ORDER BY id ASC
    `

    return results.map(r => r.id)
  }

  async getAllTypes(): Promise<string[]> {
    const pokemon = await prisma.pokemon.findMany({
      select: { types: true }
    })

    const typesSet = new Set<string>()

    pokemon.forEach(p => {
      if (Array.isArray(p.types)) {
        p.types.forEach((typeObj: any) => {
          if (typeObj.type && typeObj.type.name) {
            typesSet.add(typeObj.type.name)
          }
        })
      }
    })

    return Array.from(typesSet).sort()
  }

  getGenerationByPokemonId(id: number): PokemonGeneration | undefined {
    return POKEMON_GENERATIONS.find(gen =>
      id >= gen.range[0] && id <= gen.range[1]
    )
  }

  getTypeColor(typeName: string): string {
    const colors: { [key: string]: string } = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC'
    }
    return colors[typeName.toLowerCase()] || '#68A090'
  }

  // Statistiques pour le living dex
  getCompletionStats(capturedPokemon: number[], generation?: number): {
    caught: number
    total: number
    percentage: number
    byGeneration: Array<{
      generation: number
      name: string
      caught: number
      total: number
      percentage: number
    }>
  } {
    const stats = {
      caught: capturedPokemon.length,
      total: generation ?
        POKEMON_GENERATIONS.find(g => g.id === generation)?.range[1] || 0 -
        (POKEMON_GENERATIONS.find(g => g.id === generation)?.range[0] || 1) + 1 :
        TOTAL_POKEMON,
      percentage: 0,
      byGeneration: [] as any[]
    }

    stats.percentage = Math.round((stats.caught / stats.total) * 100)

    // Statistiques par génération
    for (const gen of POKEMON_GENERATIONS) {
      const genCaught = capturedPokemon.filter(id =>
        id >= gen.range[0] && id <= gen.range[1]
      ).length
      const genTotal = gen.range[1] - gen.range[0] + 1

      stats.byGeneration.push({
        generation: gen.id,
        name: gen.name,
        caught: genCaught,
        total: genTotal,
        percentage: Math.round((genCaught / genTotal) * 100)
      })
    }

    return stats
  }

  async getTotalCount(): Promise<number> {
    return await prisma.pokemon.count()
  }

  async getCountByGeneration(): Promise<Array<{generation: number, count: number}>> {
    const result = await prisma.pokemon.groupBy({
      by: ['generation'],
      _count: {
        id: true
      },
      orderBy: {
        generation: 'asc'
      }
    })

    return result.map(r => ({
      generation: r.generation,
      count: r._count.id
    }))
  }
}

export const pokemonDBService = new PokemonDBService()
export default pokemonDBService