"use client"

import { useState, useEffect } from "react"
import { PokemonCard } from "./pokemon-card"
import { SearchBar } from "./search-bar"
import { usePokemon } from "@/context/pokemon-context"
import { Pokemon } from "@/hooks/use-pokemon-simple"

export function PokemonGrid() {
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([])
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const pokemonPerPage = 20
  const { isPokemonCaptured } = usePokemon()

  useEffect(() => {
    async function fetchPokemon() {
      try {
        // Fetch Pokemon from local database API with pagination
        const response = await fetch("/api/pokemon?limit=20&page=1")
        const data = await response.json()

        setAllPokemon(data.pokemon || [])
        setFilteredPokemon(data.pokemon || [])
        setHasMore(data.pagination?.hasNext || false)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching Pokemon:", error)
        setIsLoading(false)
      }
    }

    fetchPokemon()
  }, [])

  useEffect(() => {
    const filtered = allPokemon.filter((pokemon) => pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredPokemon(filtered)
    setPage(1)
  }, [searchTerm, allPokemon])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const loadMore = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const nextPage = page + 1
      const response = await fetch(`/api/pokemon?limit=20&page=${nextPage}`)
      const data = await response.json()

      if (data.pokemon && data.pokemon.length > 0) {
        setAllPokemon((prev) => [...prev, ...data.pokemon])
        setFilteredPokemon((prev) => [...prev, ...data.pokemon])
        setPage(nextPage)
        setHasMore(data.pagination?.hasNext || false)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more Pokemon:", error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  const paginatedPokemon = filteredPokemon

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-bounce w-16 h-16 bg-red-500 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SearchBar onSearch={handleSearch} />

      {filteredPokemon.length === 0 ? (
        <p className="text-center text-xl">Aucun Pokémon trouvé</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {paginatedPokemon.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon as any} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                Charger plus
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
