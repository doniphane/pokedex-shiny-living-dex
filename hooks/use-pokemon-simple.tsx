"use client"

import { useState, useEffect } from 'react'
import { POKEMON_GENERATIONS, TOTAL_POKEMON } from '@/lib/pokemon-constants'

export interface Pokemon {
  id: number
  name: string
  frenchName?: string
  height: number
  weight: number
  base_experience: number
  baseExp?: number
  types: Array<{
    slot: number
    type: {
      name: string
      url: string
    }
  }>
  sprites: {
    front_default: string | null
    front_shiny: string | null
    other: {
      "official-artwork": {
        front_default: string | null
        front_shiny: string | null
      }
    }
  }
  stats: any[]
  abilities: any[]
  generation?: number
  isShiny?: boolean
  species?: {
    name: string
    url: string
  }
}

interface UsePokemonOptions {
  generations?: number[]
  limit?: number
  initialLoad?: boolean
}

interface UsePokemonReturn {
  pokemon: Pokemon[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  reload: () => Promise<void>
  searchPokemon: (query: string) => Promise<void>
  filterByGeneration: (generations: number[]) => void
  filterByType: (typeName: string) => Promise<void>
  totalLoaded: number
  totalAvailable: number
}

export function usePokemon({
  generations = [],
  limit = 20,
  initialLoad = true
}: UsePokemonOptions = {}): UsePokemonReturn {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [currentGenerations, setCurrentGenerations] = useState<number[]>(generations)

  const fetchPokemon = async (pageNum = 1, resetData = false) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: pageNum.toString()
      })

      if (currentGenerations.length > 0) {
        params.append('generation', currentGenerations.join(','))
      }

      const response = await fetch(`/api/pokemon?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const newPokemon = data.pokemon || []

      if (resetData) {
        setPokemon(newPokemon)
      } else {
        setPokemon(prev => [...prev, ...newPokemon])
      }

      setHasMore(data.pagination?.hasNext || false)
      setPage(pageNum)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  // Chargement initial
  useEffect(() => {
    if (initialLoad) {
      fetchPokemon(1, true)
    }
  }, []) // Pas de dépendances pour éviter les boucles

  const loadMore = async () => {
    if (!hasMore || loading) return
    await fetchPokemon(page + 1, false)
  }

  const reload = async () => {
    setPage(1)
    await fetchPokemon(1, true)
  }

  const searchPokemon = async (query: string) => {
    if (!query.trim()) {
      return reload()
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        search: query,
        limit: limit.toString()
      })

      const response = await fetch(`/api/pokemon?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setPokemon(data.pokemon || [])
      setHasMore(false)
    } catch (err) {
      setError('Pokémon non trouvé')
      setPokemon([])
    } finally {
      setLoading(false)
    }
  }

  const filterByGeneration = (selectedGenerations: number[]) => {
    setCurrentGenerations(selectedGenerations)
    setPage(1)
    fetchPokemon(1, true)
  }

  const filterByType = async (typeName: string) => {
    setLoading(true)
    setError(null)

    try {
      // Si pas de type sélectionné, recharger tous les Pokémon
      if (!typeName || typeName === "") {
        return reload()
      }

      const params = new URLSearchParams({
        type: typeName,
        limit: limit.toString()
      })

      const response = await fetch(`/api/pokemon?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setPokemon(data.pokemon || [])
      setHasMore(data.pagination?.hasNext || false)
      setPage(1)
    } catch (err) {
      setError('Erreur lors du filtrage par type')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalAvailable = () => {
    if (currentGenerations.length === 0) {
      return TOTAL_POKEMON
    }

    return currentGenerations.reduce((total, genId) => {
      const gen = POKEMON_GENERATIONS.find(g => g.id === genId)
      return total + (gen ? gen.range[1] - gen.range[0] + 1 : 0)
    }, 0)
  }

  return {
    pokemon,
    loading,
    error,
    hasMore,
    loadMore,
    reload,
    searchPokemon,
    filterByGeneration,
    filterByType,
    totalLoaded: pokemon.length,
    totalAvailable: calculateTotalAvailable()
  }
}

// Hook pour les statistiques du living dex
export function useLivingDexStats(capturedPokemonIds: number[]) {
  const [stats, setStats] = useState({
    caught: 0,
    total: TOTAL_POKEMON,
    percentage: 0,
    byGeneration: [] as any[]
  })

  useEffect(() => {
    const newStats = {
      caught: capturedPokemonIds.length,
      total: TOTAL_POKEMON,
      percentage: Math.round((capturedPokemonIds.length / TOTAL_POKEMON) * 100),
      byGeneration: POKEMON_GENERATIONS.map(gen => {
        const genCaught = capturedPokemonIds.filter(id =>
          id >= gen.range[0] && id <= gen.range[1]
        ).length
        const genTotal = gen.range[1] - gen.range[0] + 1

        return {
          generation: gen.id,
          name: gen.name,
          caught: genCaught,
          total: genTotal,
          percentage: Math.round((genCaught / genTotal) * 100)
        }
      })
    }
    setStats(newStats)
  }, [capturedPokemonIds])

  return stats
}