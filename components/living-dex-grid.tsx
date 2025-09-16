"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pokemon } from '@/hooks/use-pokemon-simple'
import { pokemonDBService } from '@/lib/pokemon-db-service'
import { usePokemon } from '@/context/pokemon-context'
import { Sparkles, Star, Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface LivingDexGridProps {
  pokemon: Pokemon[]
  loading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  showShinyOnly?: boolean
  compact?: boolean
}

interface PokemonCardProps {
  pokemon: Pokemon
  isCaptured: boolean
  onCapture: (pokemon: Pokemon) => void
  onRelease: (id: number) => void
  showShinyVersion?: boolean
  compact?: boolean
}

function PokemonCard({ 
  pokemon, 
  isCaptured, 
  onCapture, 
  onRelease,
  showShinyVersion = false,
  compact = false 
}: PokemonCardProps) {
  const [imageError, setImageError] = useState(false)
  const [showShiny, setShowShiny] = useState(showShinyVersion)

  const getImageUrl = () => {
    if (imageError) {
      return showShiny 
        ? pokemon.sprites.front_shiny 
        : pokemon.sprites.front_default
    }
    
    const artwork = pokemon.sprites.other?.["official-artwork"]
    if (showShiny && artwork?.front_shiny) {
      return artwork.front_shiny
    }
    return artwork?.front_default || pokemon.sprites.front_default
  }

  const toggleShinyView = () => {
    setShowShiny(!showShiny)
    setImageError(false)
  }

  const handleCapture = () => {
    const captureData = {
      ...pokemon,
      isShiny: true // Toujours capturer en version shiny pour le living dex
    }
    onCapture(captureData)
  }

  const generation = pokemonDBService.getGenerationByPokemonId(pokemon.id)
  const primaryType = pokemon.types[0]?.type.name
  const typeColor = pokemonDBService.getTypeColor(primaryType)

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg ${
      isCaptured ? 'ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50' : ''
    } ${compact ? 'h-auto' : ''}`}>
      {isCaptured && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-yellow-500 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            Capturé
          </Badge>
        </div>
      )}
      
      <CardContent className={compact ? "p-2" : "p-3"}>
        {/* En-tête avec numéro et nom */}
        <div className={`flex justify-between items-start ${compact ? 'mb-1' : 'mb-2'}`}>
          <div>
            <span className="text-sm font-bold text-gray-500">
              #{pokemon.id.toString().padStart(3, '0')}
            </span>
            <h3 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}>
              {pokemon.frenchName || pokemon.name}
            </h3>
            {pokemon.frenchName && pokemon.frenchName !== pokemon.name && !compact && (
              <p className="text-xs text-gray-500 italic capitalize">{pokemon.name}</p>
            )}
          </div>
          
          {generation && (
            <Badge variant="outline" className="text-xs">
              Gen {generation.id}
            </Badge>
          )}
        </div>

        {/* Image du Pokémon */}
        <div className={`relative ${compact ? 'mb-2' : 'mb-3'} flex justify-center`}>
          <div className={`relative ${compact ? 'w-16 h-16' : 'w-24 h-24'} flex items-center justify-center`}>
            {getImageUrl() ? (
              <>
                <Image
                  src={getImageUrl()!}
                  alt={pokemon.frenchName || pokemon.name}
                  width={compact ? 64 : 96}
                  height={compact ? 64 : 96}
                  className="object-contain"
                  onError={() => setImageError(true)}
                />
                {(showShiny || showShinyVersion) && (
                  <div className="absolute -top-1 -right-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </div>
                )}
              </>
            ) : (
              <div className={`${compact ? 'w-16 h-16' : 'w-24 h-24'} bg-gray-200 rounded-lg flex items-center justify-center`}>
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>
          
          {/* Bouton pour basculer entre normal et shiny */}
          {pokemon.sprites.other?.["official-artwork"]?.front_shiny && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute bottom-0 right-0 p-1 h-6 w-6 rounded-full"
              onClick={toggleShinyView}
            >
              {showShiny ? (
                <EyeOff className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>

        {/* Types */}
        <div className={`flex flex-wrap gap-1 ${compact ? 'mb-1' : 'mb-2'}`}>
          {pokemon.types.map((typeInfo) => (
            <Badge
              key={typeInfo.type.name}
              className={`${compact ? 'text-xs px-1 py-0' : 'text-xs'} text-white`}
              style={{ backgroundColor: pokemonDBService.getTypeColor(typeInfo.type.name) }}
            >
              {compact ? typeInfo.type.name.slice(0, 3) : typeInfo.type.name}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          {isCaptured ? (
            <Button
              variant="destructive"
              size="sm"
              className={`w-full ${compact ? 'h-6 text-xs px-2' : 'h-8 text-xs'}`}
              onClick={() => onRelease(pokemon.id)}
            >
              {compact ? 'Lib.' : 'Libérer'}
            </Button>
          ) : (
            <Button
              size="sm"
              className={`w-full ${compact ? 'h-6 text-xs px-2' : 'h-8 text-xs'} bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700`}
              onClick={handleCapture}
            >
              <Sparkles className={`${compact ? 'w-2 h-2' : 'w-3 h-3'} ${compact ? '' : 'mr-1'}`} />
              {compact ? '' : 'Capturer'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function LivingDexGrid({
  pokemon,
  loading = false,
  onLoadMore,
  hasMore = false,
  showShinyOnly = false,
  compact = false
}: LivingDexGridProps) {
  const { capturedPokemon, capturePokemon, releasePokemon, isPokemonCaptured } = usePokemon()

  return (
    <div className="space-y-6">
      {/* Grille des Pokémon */}
      <div className={`grid ${compact ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'}`}>
        {pokemon.map((pkmn) => (
          <PokemonCard
            key={pkmn.id}
            pokemon={pkmn}
            isCaptured={isPokemonCaptured(pkmn.id)}
            onCapture={capturePokemon}
            onRelease={releasePokemon}
            showShinyVersion={showShinyOnly}
            compact={compact}
          />
        ))}
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Bouton Charger plus */}
      {hasMore && !loading && (
        <div className="flex justify-center py-6">
          <Button onClick={onLoadMore} size="lg">
            Charger plus de Pokémon
          </Button>
        </div>
      )}

      {/* Message de fin */}
      {!hasMore && pokemon.length > 0 && !loading && (
        <div className="text-center py-6">
          <p className="text-gray-600">
            🎉 Vous avez vu tous les Pokémon disponibles !
          </p>
        </div>
      )}
    </div>
  )
}