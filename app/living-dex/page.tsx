"use client"

import { useState } from 'react'
import { usePokemon } from '@/hooks/use-pokemon-simple'
import { PokemonFilters } from '@/components/pokemon-filters'
import { LivingDexGrid } from '@/components/living-dex-grid'
import { LivingDexStats } from '@/components/living-dex-stats'
import { usePokemon as usePokemonContext } from '@/context/pokemon-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Sparkles, Target, Trophy, Eye, EyeOff } from 'lucide-react'
import { POKEMON_GENERATIONS } from '@/lib/pokemon-db-service'

export default function LivingDexPage() {
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([])
  const [showCapturedOnly, setShowCapturedOnly] = useState(false)
  const [showUncapturedOnly, setShowUncapturedOnly] = useState(false)
  const [compactView, setCompactView] = useState(false)
  
  const {
    pokemon,
    loading,
    error,
    hasMore,
    loadMore,
    reload,
    searchPokemon,
    filterByGeneration,
    filterByType,
    totalLoaded,
    totalAvailable
  } = usePokemon({
    generations: selectedGenerations,
    limit: 20,
    initialLoad: true
  })

  const { capturedPokemon } = usePokemonContext()
  const capturedIds = capturedPokemon.map(p => p.id)

  const handleGenerationFilter = (generations: number[]) => {
    setSelectedGenerations(generations)
    filterByGeneration(generations)
  }

  const clearFilters = () => {
    setSelectedGenerations([])
    setShowCapturedOnly(false)
    setShowUncapturedOnly(false)
    reload()
  }

  // Filtrer les Pokémon selon les options d'affichage
  const filteredPokemon = pokemon.filter(p => {
    const isCaptured = capturedIds.includes(p.id)
    
    if (showCapturedOnly) return isCaptured
    if (showUncapturedOnly) return !isCaptured
    return true
  })

  const completionPercentage = Math.round((capturedIds.length / totalAvailable) * 100)

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header spécialisé Living Dex */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
          <Sparkles className="inline w-16 h-16 mr-4 text-yellow-500" />
          Shiny Living Dex
        </h1>
        <p className="text-2xl text-gray-700 mb-6">
          Collection complète de tous les Pokémon en version Shiny
        </p>
        
        {/* Statistiques rapides */}\n        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg border">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="font-bold text-lg">{capturedIds.length}</span>
            <span className="text-gray-600">Capturés</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg border">
            <Target className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-lg">{totalAvailable - capturedIds.length}</span>
            <span className="text-gray-600">Restants</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg border">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <span className="font-bold text-lg">{completionPercentage}%</span>
            <span className="text-gray-600">Complété</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar avec stats */}
        <div className="lg:col-span-1">
          <LivingDexStats capturedPokemonIds={capturedIds} />
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3 space-y-6">
          {/* Options d'affichage spéciales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Options d'affichage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="captured-only"
                    checked={showCapturedOnly}
                    onCheckedChange={(checked) => {
                      setShowCapturedOnly(checked)
                      if (checked) setShowUncapturedOnly(false)
                    }}
                  />
                  <Label htmlFor="captured-only" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Capturés uniquement
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="uncaptured-only"
                    checked={showUncapturedOnly}
                    onCheckedChange={(checked) => {
                      setShowUncapturedOnly(checked)
                      if (checked) setShowCapturedOnly(false)
                    }}
                  />
                  <Label htmlFor="uncaptured-only" className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-500" />
                    Non capturés uniquement
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="compact-view"
                    checked={compactView}
                    onCheckedChange={setCompactView}
                  />
                  <Label htmlFor="compact-view">Vue compacte</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtres */}
          <PokemonFilters
            onSearch={searchPokemon}
            onGenerationFilter={handleGenerationFilter}
            onTypeFilter={filterByType}
            onClearFilters={clearFilters}
            selectedGenerations={selectedGenerations}
            loading={loading}
          />

          {/* Progress par génération sélectionnée */}
          {selectedGenerations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Progression pour les générations sélectionnées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedGenerations.map(genId => {
                    const generation = POKEMON_GENERATIONS.find(g => g.id === genId)
                    if (!generation) return null
                    
                    const genCaptured = capturedIds.filter(id => 
                      id >= generation.range[0] && id <= generation.range[1]
                    ).length
                    const genTotal = generation.range[1] - generation.range[0] + 1
                    const genPercentage = Math.round((genCaptured / genTotal) * 100)
                    
                    return (
                      <Badge key={genId} variant={genPercentage === 100 ? "default" : "secondary"}>
                        {generation.name}: {genCaptured}/{genTotal} ({genPercentage}%)
                      </Badge>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Résultats */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-800 text-center">{error}</p>
              </CardContent>
            </Card>
          )}

          {filteredPokemon.length === 0 && !loading && !error && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {showCapturedOnly ? "Aucun Pokémon capturé" : 
                   showUncapturedOnly ? "Tous les Pokémon sont capturés !" :
                   "Aucun Pokémon trouvé"}
                </CardTitle>
                <CardDescription>
                  {showCapturedOnly ? "Commencez à capturer des Pokémon pour les voir ici !" :
                   showUncapturedOnly ? "Félicitations ! Vous avez tout capturé dans cette sélection !" :
                   "Essayez de modifier vos filtres"}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <div className="space-y-4">
            {filteredPokemon.length > 0 && (
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">
                  {filteredPokemon.length} Pokémon trouvés
                </p>
                <Badge variant="outline">
                  Chargés: {totalLoaded} / {totalAvailable}
                </Badge>
              </div>
            )}
            
            <LivingDexGrid
              pokemon={filteredPokemon}
              loading={loading}
              onLoadMore={loadMore}
              hasMore={hasMore && !showCapturedOnly && !showUncapturedOnly}
              showShinyOnly={true}
              compact={compactView}
            />
          </div>
        </div>
      </div>
    </main>
  )
}