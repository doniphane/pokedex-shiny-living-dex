"use client"

import { useState } from 'react'
import { usePokemon } from '@/hooks/use-pokemon-simple'
import { PokemonFilters } from '@/components/pokemon-filters'
import { LivingDexGrid } from '@/components/living-dex-grid'
import { LivingDexStats } from '@/components/living-dex-stats'
import { usePokemon as usePokemonContext } from '@/context/pokemon-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Sparkles, Target, Trophy, Eye } from 'lucide-react'
import { POKEMON_GENERATIONS } from '@/lib/pokemon-constants'

interface LivingDexClientProps {
  totalAvailable: number
}

export function LivingDexClient({ totalAvailable }: LivingDexClientProps) {
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
    totalLoaded
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
  )
}