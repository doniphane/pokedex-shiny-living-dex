"use client"

import { useState } from 'react'
import { usePokemon } from '@/hooks/use-pokemon-simple'
import { PokemonFilters } from '@/components/pokemon-filters'
import { LivingDexGrid } from '@/components/living-dex-grid'
import { LivingDexStats } from '@/components/living-dex-stats'
import { usePokemon as usePokemonContext } from '@/context/pokemon-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Grid, BarChart3 } from 'lucide-react'

export default function Home() {
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState('pokemon')
  
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
    reload()
  }

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      {/* En-tête */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
          <Sparkles className="inline w-12 h-12 mr-2 text-yellow-500" />
          Shiny Living Dex
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Capturez tous les Pokémon en version shiny ! De la Génération 1 à 9 - {totalAvailable.toLocaleString()} Pokémon au total
        </p>
      </div>


      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pokemon" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Pokémon ({totalLoaded.toLocaleString()})
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="captured" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Mes Captures ({capturedIds.length})
          </TabsTrigger>
        </TabsList>

        {/* Onglet Pokémon */}
        <TabsContent value="pokemon" className="space-y-6">
          {/* Filtres */}
          <PokemonFilters
            onSearch={searchPokemon}
            onGenerationFilter={handleGenerationFilter}
            onTypeFilter={filterByType}
            onClearFilters={clearFilters}
            selectedGenerations={selectedGenerations}
            loading={loading}
          />

          {/* Message d'erreur */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-800 text-center">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Informations de chargement */}
          {!loading && pokemon.length === 0 && !error && (
            <Card>
              <CardHeader>
                <CardTitle>Aucun Pokémon trouvé</CardTitle>
                <CardDescription>
                  Essayez de modifier vos filtres ou d'effectuer une nouvelle recherche
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Grille des Pokémon */}
          {pokemon.length > 0 && (
            <LivingDexGrid
              pokemon={pokemon}
              loading={loading}
              onLoadMore={loadMore}
              hasMore={hasMore}
              showShinyOnly={false}
            />
          )}
        </TabsContent>

        {/* Onglet Statistiques */}
        <TabsContent value="stats">
          <LivingDexStats 
            capturedPokemonIds={capturedIds}
            className="max-w-4xl mx-auto"
          />
        </TabsContent>

        {/* Onglet Mes Captures */}
        <TabsContent value="captured" className="space-y-6">
          {capturedPokemon.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Sparkles className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <CardTitle className="mb-2">Aucun Pokémon shiny capturé</CardTitle>
                <CardDescription>
                  Commencez votre collection en capturant des Pokémon depuis l'onglet "Pokémon" !
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Ma Collection Shiny
                  </CardTitle>
                  <CardDescription>
                    {capturedPokemon.length} Pokémon shiny dans votre collection
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <LivingDexGrid
                pokemon={capturedPokemon as any}
                loading={false}
                hasMore={false}
                showShinyOnly={true}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}
