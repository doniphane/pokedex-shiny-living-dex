"use client"

import { getTypeColor } from "@/lib/pokemon-utils"
import { usePokemon } from "@/context/pokemon-context"
import { useAuth } from "@/context/auth-context"
import { useState, useEffect } from "react"
import { Sparkles, Star } from "lucide-react"

interface PokemonCardProps {
  pokemon: {
    id: number
    name: string
    sprites: {
      other: {
        "official-artwork": {
          front_default: string
          front_shiny?: string
        }
      }
      front_default?: string
      front_shiny?: string
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
  const [showShiny, setShowShiny] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const isCaptured = isPokemonCaptured(pokemon.id)

  // Mettre à jour automatiquement l'affichage shiny quand le Pokémon est capturé
  useEffect(() => {
    if (isCaptured && !showShiny) {
      setIsTransitioning(true)
      setTimeout(() => {
        setShowShiny(true)
        setIsTransitioning(false)
      }, 300)
    } else if (!isCaptured && showShiny) {
      setIsTransitioning(true)
      setTimeout(() => {
        setShowShiny(false)
        setIsTransitioning(false)
      }, 300)
    }
  }, [isCaptured, showShiny])

  const mainType = pokemon.types[0]?.type.name || "normal"
  const gradientStyle = {
    background: `linear-gradient(to bottom, ${getTypeColor(mainType)}, #ffffff)`,
  }

  // Sélectionner l'image appropriée (shiny si capturé ou affichage forcé)
  const getImageUrl = () => {
    const artwork = pokemon.sprites.other?.["official-artwork"]
    if (showShiny && artwork?.front_shiny) {
      return artwork.front_shiny
    }
    return artwork?.front_default || pokemon.sprites.front_default || "/placeholder.svg"
  }

  const handleCapture = async () => {
    if (!user) {
      alert("Vous devez vous connecter pour capturer des Pokémon")
      return
    }

    setIsCapturing(true)
    setIsTransitioning(true)

    // Simuler un délai pour l'animation de capture
    setTimeout(async () => {
      const captureData = {
        ...pokemon,
        isShiny: true // Toujours capturer en version shiny
      }
      await capturePokemon(captureData)
      setIsCapturing(false)
      // isTransitioning sera géré par useEffect lors du changement de statut
    }, 1000)
  }

  const handleRelease = async () => {
    await releasePokemon(pokemon.id)
  }

  return (
    <div
      className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 ${
        isCaptured ? 'ring-2 ring-yellow-400 shadow-yellow-200' : ''
      } ${isTransitioning ? 'scale-105' : ''}`}
      style={gradientStyle}
    >
      {isCaptured && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Shiny
          </div>
        </div>
      )}

      <div className="p-4 flex flex-col items-center relative">
        <div className="relative w-full pt-[100%]">
          <div className={`absolute inset-0 transition-all duration-500 ${isTransitioning ? 'scale-110 rotate-12' : ''}`}>
            <img
              src={getImageUrl()}
              alt={pokemon.name}
              className={`w-full h-full object-contain transition-all duration-300 ${
                showShiny ? "brightness-110 saturate-125 drop-shadow-lg" : ""
              } ${isCapturing || isTransitioning ? "animate-pulse" : ""}`}
            />
            {/* Effet sparkles pour les versions shiny */}
            {showShiny && (
              <div className="absolute inset-0 pointer-events-none">
                <Sparkles className="absolute top-2 right-2 w-4 h-4 text-yellow-400 animate-ping" />
                <Sparkles className="absolute bottom-3 left-3 w-3 h-3 text-yellow-300 animate-ping animation-delay-300" />
                <Sparkles className="absolute top-4 left-2 w-3 h-3 text-yellow-500 animate-ping animation-delay-700" />
              </div>
            )}
          </div>
          {(showShiny || isCaptured) && (
            <div className="absolute -top-2 -right-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />
            </div>
          )}
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

          {(showShiny || isCaptured) && (
            <div className="mt-2">
              <span className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold animate-pulse">
                ✨ Shiny
              </span>
            </div>
          )}

          <div className="mt-4">
            {!showReleaseButton ? (
              <>
                {!isCaptured ? (
                  <button
                    onClick={handleCapture}
                    disabled={isCapturing || isTransitioning}
                    className={`px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 ${
                      isCapturing || isTransitioning ? 'animate-pulse' : ''
                    }`}
                  >
                    {isCapturing ? (
                      <>
                        <Sparkles className="w-4 h-4 inline mr-2 animate-spin" />
                        Capture en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 inline mr-2" />
                        Capturer en Shiny
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center justify-center text-sm text-green-600 font-medium">
                    <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                    ✓ Capturé en Shiny
                  </div>
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
