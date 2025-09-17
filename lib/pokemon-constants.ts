export interface PokemonGeneration {
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