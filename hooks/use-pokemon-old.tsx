"use client"

import { useState, useEffect, useCallback } from 'react'
import { pokemonDBService } from '@/lib/pokemon-db-service'
import { Pokemon, POKEMON_GENERATIONS, TOTAL_POKEMON } from '@/lib/pokemon-constants'

interface UsePokemonOptions {
  generations?: number[]
  types?: string[]
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
  types = [],
  limit = 50,
  initialLoad = true
}: UsePokemonOptions = {}): UsePokemonReturn {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [currentFilters, setCurrentFilters] = useState({ generations, types })

  const calculateTotalAvailable = useCallback(() => {
    if (currentFilters.generations.length === 0) {
      return TOTAL_POKEMON
    }
    
    return currentFilters.generations.reduce((total, genId) => {
      const gen = POKEMON_GENERATIONS.find(g => g.id === genId)
      return total + (gen ? gen.range[1] - gen.range[0] + 1 : 0)
    }, 0)
  }, [currentFilters.generations])

  const loadPokemon = useCallback(async (reset = false) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const currentOffset = reset ? 0 : offset

      // Build query parameters
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: currentOffset.toString()
      })

      if (currentFilters.generations.length > 0) {
        params.append('generation', currentFilters.generations.join(','))
      }

      const response = await fetch(`/api/pokemon?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const newPokemon = data.pokemon || []
      
      if (reset) {
        setPokemon(newPokemon)
        setOffset(limit)
      } else {
        setPokemon(prev => [...prev, ...newPokemon])
        setOffset(prev => prev + limit)
      }

      // Vérifier s'il y a plus de Pokémon à charger
      const totalAvailable = calculateTotalAvailable()
      setHasMore(currentOffset + newPokemon.length < totalAvailable)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des Pokémon')
    } finally {
      setLoading(false)
    }
  }, [loading, offset, limit, currentFilters, calculateTotalAvailable])

  const loadMore = useCallback(() => {
    return loadPokemon(false)
  }, [loadPokemon])

  const reload = useCallback(() => {
    setOffset(0)
    return loadPokemon(true)
  }, [loadPokemon])

  const searchPokemon = useCallback(async (query: string) => {
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
      const results = data.pokemon || []

      setPokemon(results)
      setHasMore(false)
    } catch (err) {
      setError('Pokémon non trouvé')
      setPokemon([])
    } finally {
      setLoading(false)
    }
  }, [reload, limit])

  const filterByGeneration = useCallback((selectedGenerations: number[]) => {
    console.log('🔄 filterByGeneration called:', selectedGenerations)
    setCurrentFilters(prev => ({ ...prev, generations: selectedGenerations }))
    setOffset(0)
    setPokemon([])
    // Ne pas appeler loadPokemon ici - laisser le useEffect s'en charger
  }, [])

  const filterByType = useCallback(async (typeName: string) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        type: typeName,
        limit: limit.toString()
      })

      const response = await fetch(`/api/pokemon?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const filteredPokemon = data.pokemon || []

      setPokemon(filteredPokemon)
      setHasMore(data.pagination?.hasNext || false)
      setOffset(limit)
    } catch (err) {
      setError('Erreur lors du filtrage par type')
    } finally {
      setLoading(false)
    }
  }, [limit])

  // Chargement initial
  useEffect(() => {
    if (initialLoad && pokemon.length === 0 && !loading) {
      console.log('🔄 Initial load triggered')
      loadPokemon(true)
    }
  }, [initialLoad])

  // Rechargement quand les filtres changent
  useEffect(() => {
    const generationsChanged =
      currentFilters.generations.length !== generations.length ||
      !currentFilters.generations.every(g => generations.includes(g))

    if (generationsChanged) {
      console.log('🔄 Generations changed, reloading:', currentFilters.generations)
      loadPokemon(true)
    }
  }, [currentFilters.generations])

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