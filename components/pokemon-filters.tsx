"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { POKEMON_GENERATIONS } from '@/lib/pokemon-constants'
import { Search, Filter, X } from 'lucide-react'

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
]

interface PokemonFiltersProps {
  onSearch: (query: string) => void
  onGenerationFilter: (generations: number[]) => void
  onTypeFilter: (type: string) => void
  onClearFilters: () => void
  selectedGenerations: number[]
  loading?: boolean
}

export function PokemonFilters({
  onSearch,
  onGenerationFilter,
  onTypeFilter,
  onClearFilters,
  selectedGenerations,
  loading = false
}: PokemonFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const toggleGeneration = (genId: number) => {
    const newSelection = selectedGenerations.includes(genId)
      ? selectedGenerations.filter(id => id !== genId)
      : [...selectedGenerations, genId]
    onGenerationFilter(newSelection)
  }

  const handleTypeFilter = (type: string) => {
    if (type === "all") {
      setSelectedType("")
      onTypeFilter("")
    } else {
      setSelectedType(type)
      onTypeFilter(type)
    }
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedType('')
    onClearFilters()
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtres et Recherche
        </CardTitle>
        <CardDescription>
          Recherchez en français ou anglais et filtrez les Pokémon pour votre Living Dex
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="search">Rechercher un Pokémon (Français/Anglais)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                type="text"
                placeholder="Nom français ou anglais, ou numéro (ex: Pikachu, 25)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="mt-6">
            Rechercher
          </Button>
        </form>

        {/* Filtres par génération */}
        <div>
          <Label className="text-base font-semibold">Générations</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {POKEMON_GENERATIONS.map((gen) => (
              <Badge
                key={gen.id}
                variant={selectedGenerations.includes(gen.id) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => toggleGeneration(gen.id)}
              >
                Gen {gen.id} - {gen.name}
                <span className="ml-1 text-xs">
                  ({gen.range[0]}-{gen.range[1]})
                </span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Filtre par type */}
        <div>
          <Label htmlFor="type-select" className="text-base font-semibold">
            Filtrer par Type
          </Label>
          <Select value={selectedType || "all"} onValueChange={handleTypeFilter}>
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {POKEMON_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  <span className="capitalize">{type}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bouton pour effacer tous les filtres */}
        {(selectedGenerations.length > 0 || selectedType || searchQuery) && (
          <div className="flex justify-center pt-4 border-t">
            <Button variant="outline" onClick={clearAllFilters}>
              <X className="w-4 h-4 mr-2" />
              Effacer tous les filtres
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}