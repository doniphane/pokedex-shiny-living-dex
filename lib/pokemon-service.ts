import { searchFrenchNames, getFrenchPokemonId } from './pokemon-french-names'

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
  species: {
    name: string
    url: string
  }
  generation?: number
  isShiny?: boolean
}

export interface PokemonSpecies {
  id: number
  name: string
  names: Array<{
    name: string
    language: {
      name: string
    }
  }>
  generation: {
    name: string
  }
  habitat: {
    name: string
  } | null
  is_legendary: boolean
  is_mythical: boolean
  color: {
    name: string
  }
  flavor_text_entries: Array<{
    flavor_text: string
    language: {
      name: string
    }
  }>
}

class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2'
  private cache = new Map<string, any>()
  private readonly CACHE_DURATION = 1000 * 60 * 60 // 1 heure

  private getCacheKey(endpoint: string): string {
    return `pokemon_${endpoint.replace(/\//g, '_')}`
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION
  }

  private async fetchWithCache<T>(endpoint: string): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint)
    const cached = this.cache.get(cacheKey)
    
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })
      
      return data
    } catch (error) {
      console.error(`Erreur lors de la récupération de ${endpoint}:`, error)
      throw error
    }
  }

  async getPokemon(id: number): Promise<Pokemon> {
    const pokemon = await this.fetchWithCache<Pokemon>(`/pokemon/${id}`)
    
    // Récupérer le nom français depuis les species
    let frenchName = pokemon.name
    try {
      const species = await this.getPokemonSpecies(id)
      const frenchNameEntry = species.names?.find(name => name.language.name === 'fr')
      if (frenchNameEntry) {
        frenchName = frenchNameEntry.name
      }
    } catch (error) {
      console.log(`Nom français non trouvé pour ${pokemon.name}`)
    }
    
    // Ajouter la génération
    const generation = this.getGenerationByPokemonId(id)
    return {
      ...pokemon,
      frenchName,
      generation: generation?.id
    }
  }

  async getPokemonSpecies(id: number): Promise<PokemonSpecies> {
    return this.fetchWithCache<PokemonSpecies>(`/pokemon-species/${id}`)
  }

  async getPokemonBatch(ids: number[]): Promise<Pokemon[]> {
    const promises = ids.map(id => this.getPokemon(id).catch(err => {
      console.error(`Erreur pour le Pokémon ${id}:`, err)
      return null
    }))
    
    const results = await Promise.all(promises)
    return results.filter((pokemon): pokemon is Pokemon => pokemon !== null)
  }

  async getAllPokemon(options: {
    generations?: number[]
    limit?: number
    offset?: number
  } = {}): Promise<Pokemon[]> {
    const { generations, limit = 50, offset = 0 } = options
    
    let pokemonIds: number[] = []
    
    if (generations && generations.length > 0) {
      // Récupérer les IDs pour les générations spécifiées
      for (const genId of generations) {
        const gen = POKEMON_GENERATIONS.find(g => g.id === genId)
        if (gen) {
          for (let i = gen.range[0]; i <= gen.range[1]; i++) {
            pokemonIds.push(i)
          }
        }
      }
    } else {
      // Tous les Pokémon de la Gen 1 à 9
      for (let i = 1; i <= TOTAL_POKEMON; i++) {
        pokemonIds.push(i)
      }
    }
    
    // Appliquer la pagination
    const paginatedIds = pokemonIds.slice(offset, offset + limit)
    
    return this.getPokemonBatch(paginatedIds)
  }

  getGenerationByPokemonId(id: number): PokemonGeneration | undefined {
    return POKEMON_GENERATIONS.find(gen => 
      id >= gen.range[0] && id <= gen.range[1]
    )
  }

  async searchPokemon(query: string): Promise<Pokemon[]> {
    try {
      // Recherche par ID si c'est un nombre d'abord
      const id = parseInt(query)
      if (!isNaN(id) && id >= 1 && id <= TOTAL_POKEMON) {
        const pokemon = await this.getPokemon(id)
        return [pokemon]
      }

      // Sinon recherche par nom (non implémentée dans ce service legacy)
      return []
    } catch {
      return []
    }
  }


  async getPokemonByType(typeName: string): Promise<number[]> {
    try {
      const typeData = await this.fetchWithCache<{
        pokemon: Array<{ pokemon: { name: string, url: string } }>
      }>(`/type/${typeName.toLowerCase()}`)
      
      return typeData.pokemon.map(p => {
        const id = parseInt(p.pokemon.url.split('/').slice(-2, -1)[0])
        return id
      }).filter(id => id <= TOTAL_POKEMON)
    } catch {
      return []
    }
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
}

export const pokemonService = new PokemonService()
export default pokemonService