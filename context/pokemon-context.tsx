"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"

interface Pokemon {
  id: number
  name: string
  frenchName?: string
  height?: number
  weight?: number
  base_experience?: number
  baseExp?: number
  sprites: {
    front_default?: string | null
    front_shiny?: string | null
    other: {
      "official-artwork": {
        front_default: string | null
        front_shiny?: string | null
      }
    }
  }
  types: {
    slot?: number
    type: {
      name: string
      url?: string
    }
  }[]
  stats?: any[]
  abilities?: any[]
  generation?: number
  isShiny?: boolean
  species?: {
    name: string
    url: string
  }
}


interface PokemonContextType {
  capturedPokemon: Pokemon[]
  capturePokemon: (pokemon: Pokemon) => Promise<void>
  releasePokemon: (id: number) => Promise<void>
  isPokemonCaptured: (id: number) => boolean
  isLoading: boolean
}

const PokemonContext = createContext<PokemonContextType | undefined>(undefined)

export function PokemonProvider({ children }: { children: ReactNode }) {
  const [capturedPokemon, setCapturedPokemon] = useState<Pokemon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Charger les Pokémon capturés depuis la base de données
  useEffect(() => {
    const loadCapturedPokemon = async () => {
      if (!user) {
        setCapturedPokemon([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch('/api/pokemon/captured')
        if (response.ok) {
          const data = await response.json()
          setCapturedPokemon(data.pokemon)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des Pokémon capturés:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCapturedPokemon()
  }, [user])

  const capturePokemon = async (pokemon: Pokemon) => {
    if (!user) {
      alert("Vous devez être connecté pour capturer des Pokémon")
      return
    }

    try {
      // Vérifier si le Pokémon est déjà capturé
      const alreadyCaptured = capturedPokemon.some((p) => p.id === pokemon.id)

      if (!alreadyCaptured) {
        const response = await fetch('/api/pokemon/capture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pokemon }),
        })

        if (response.ok) {
          // Mettre à jour l'état local
          const newPokemon = { ...pokemon, isShiny: true }
          setCapturedPokemon((prev) => [...prev, newPokemon])
        } else {
          const data = await response.json()
          alert(data.error || "Erreur lors de la capture du Pokémon")
        }
      }
    } catch (error) {
      console.error("Erreur lors de la capture du Pokémon:", error)
      alert("Erreur lors de la capture du Pokémon")
    }
  }

  const releasePokemon = async (id: number) => {
    if (!user) return

    try {
      const response = await fetch('/api/pokemon/release', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pokemonId: id }),
      })

      if (response.ok) {
        // Mettre à jour l'état local
        setCapturedPokemon((prev) => prev.filter((pokemon) => pokemon.id !== id))
      } else {
        alert("Erreur lors de la libération du Pokémon")
      }
    } catch (error) {
      console.error("Erreur lors de la libération du Pokémon:", error)
      alert("Erreur lors de la libération du Pokémon")
    }
  }

  const isPokemonCaptured = (id: number) => {
    return capturedPokemon.some((pokemon) => pokemon.id === id)
  }

  return (
    <PokemonContext.Provider value={{ capturedPokemon, capturePokemon, releasePokemon, isPokemonCaptured, isLoading }}>
      {children}
    </PokemonContext.Provider>
  )
}

export function usePokemon() {
  const context = useContext(PokemonContext)
  if (context === undefined) {
    throw new Error("usePokemon must be used within a PokemonProvider")
  }
  return context
}
