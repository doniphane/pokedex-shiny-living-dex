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
  }
}

export interface Pokemon {
  id: number
  name: string
  frenchName?: string
  height: number
  weight: number
  base_experience: number
  baseExp?: number
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
  generation?: number
  isShiny?: boolean
  species?: {
    name: string
    url: string
  }
}

// Type simplifié pour les composants qui n'ont pas besoin de toutes les propriétés
export interface SimplePokemon {
  id: number
  name: string
  frenchName?: string
  sprites: {
    other: {
      "official-artwork": {
        front_default: string | null
      }
    }
  }
  types: Array<{
    type: {
      name: string
    }
  }>
  isShiny?: boolean
}