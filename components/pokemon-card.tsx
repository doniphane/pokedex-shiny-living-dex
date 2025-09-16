"use client"

import { getTypeColor } from "@/lib/pokemon-utils"
import { usePokemon } from "@/context/pokemon-context"
import { useAuth } from "@/context/auth-context"
import { useState } from "react"

interface PokemonCardProps {
  pokemon: {
    id: number
    name: string
    sprites: {
      other: {
        "official-artwork": {
          front_default: string
        }
      }
    }
    types: {
      type: {
        name: string
      }
    }[]
    isShiny?: boolean
  }
  showReleaseButton?: boolean
}

export function PokemonCard({ pokemon, showReleaseButton = false }: PokemonCardProps) {
  const { capturePokemon, releasePokemon, isPokemonCaptured } = usePokemon()
  const { user } = useAuth()
  const [isCapturing, setIsCapturing] = useState(false)

  const mainType = pokemon.types[0]?.type.name || "normal"
  const gradientStyle = {
    background: `linear-gradient(to bottom, ${getTypeColor(mainType)}, #ffffff)`,
  }

  // URL de l'image shiny (simulée en ajoutant un filtre sur l'image normale)
  const imageUrl = pokemon.sprites.other["official-artwork"].front_default || "/placeholder.svg"

  const handleCapture = async () => {
    if (!user) {
      alert("Vous devez vous connecter pour capturer des Pokémon")
      return
    }

    setIsCapturing(true)
    // Simuler un délai pour l'animation de capture
    setTimeout(async () => {
      await capturePokemon(pokemon)
      setIsCapturing(false)
    }, 1000)
  }

  const handleRelease = async () => {
    await releasePokemon(pokemon.id)
  }

  const isCaptured = isPokemonCaptured(pokemon.id)

  return (
    <div
      className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
      style={gradientStyle}
    >
      <div className="p-4 flex flex-col items-center">
        <div className="relative w-full pt-[100%]">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={pokemon.name}
            className={`absolute inset-0 w-full h-full object-contain transition-all duration-300 ${
              pokemon.isShiny ? "hue-rotate-30 brightness-110 saturate-150" : ""
            } ${isCapturing ? "animate-pulse" : ""}`}
          />
        </div>

        <div className="w-full text-center mt-2">
          <p className="text-gray-500 text-xs">#{pokemon.id.toString().padStart(3, "0")}</p>
          <h2 className="font-bold text-xl capitalize">{pokemon.name.replace(/-/g, " ")}</h2>

          <div className="flex justify-center gap-2 mt-2">
            {pokemon.types.map((type) => (
              <span
                key={type.type.name}
                className="px-3 py-1 rounded-full text-xs text-white font-semibold"
                style={{ backgroundColor: getTypeColor(type.type.name) }}
              >
                {type.type.name}
              </span>
            ))}
          </div>

          {pokemon.isShiny && (
            <div className="mt-2">
              <span className="px-3 py-1 rounded-full text-xs bg-yellow-400 text-white font-semibold">✨ Shiny</span>
            </div>
          )}

          <div className="mt-4">
            {!showReleaseButton ? (
              <>
                {!isCaptured ? (
                  <button
                    onClick={handleCapture}
                    disabled={isCapturing}
                    className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isCapturing ? "Capture en cours..." : "Capturer en Shiny"}
                  </button>
                ) : (
                  <span className="text-sm text-green-600 font-medium">✓ Déjà capturé</span>
                )}
              </>
            ) : (
              <button
                onClick={handleRelease}
                className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
              >
                Relâcher
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
