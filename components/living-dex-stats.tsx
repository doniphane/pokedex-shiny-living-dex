"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useLivingDexStats } from '@/hooks/use-pokemon-simple'
import { Trophy, Star, Target, TrendingUp } from 'lucide-react'

interface LivingDexStatsProps {
  capturedPokemonIds: number[]
  className?: string
}

export function LivingDexStats({ capturedPokemonIds, className }: LivingDexStatsProps) {
  const stats = useLivingDexStats(capturedPokemonIds)

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 70) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    if (percentage >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getProgressLabel = (percentage: number) => {
    if (percentage >= 90) return 'Maître Pokémon! 🏆'
    if (percentage >= 70) return 'Expert Shiny! ⭐'
    if (percentage >= 50) return 'Collectionneur Avancé! 🎯'
    if (percentage >= 25) return 'Dresseur Prometteur! 📈'
    return 'Début d\'Aventure! 🌟'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistiques globales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Progression Living Dex Shiny
          </CardTitle>
          <CardDescription>
            Suivez votre progression dans la capture de tous les Pokémon shiny
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress bar principal */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">
                {stats.caught} / {stats.total} Pokémon
              </span>
              <Badge className={getProgressColor(stats.percentage)}>
                {stats.percentage}%
              </Badge>
            </div>
            <Progress 
              value={stats.percentage} 
              className="h-3"
            />
            <p className="text-center text-sm text-gray-600 font-medium">
              {getProgressLabel(stats.percentage)}
            </p>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{stats.caught}</p>
              <p className="text-sm text-gray-600">Capturés</p>
            </div>
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-blue-600">{stats.total - stats.caught}</p>
              <p className="text-sm text-gray-600">Restants</p>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold text-purple-600">{stats.byGeneration.length}</p>
              <p className="text-sm text-gray-600">Générations</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-green-600">{stats.percentage}%</p>
              <p className="text-sm text-gray-600">Complété</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progression par génération */}
      <Card>
        <CardHeader>
          <CardTitle>Progression par Génération</CardTitle>
          <CardDescription>
            Détail de votre collection par région Pokémon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.byGeneration.map((gen) => (
              <div key={gen.generation} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Gen {gen.generation}
                    </Badge>
                    <span className="font-medium">{gen.name}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {gen.caught} / {gen.total} ({gen.percentage}%)
                  </span>
                </div>
                <Progress 
                  value={gen.percentage} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conseils et objectifs */}
      <Card>
        <CardHeader>
          <CardTitle>Conseils & Objectifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.percentage < 10 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  🎯 <strong>Objectif débutant :</strong> Essayez de capturer 50 Pokémon shiny pour commencer votre collection !
                </p>
              </div>
            )}
            
            {stats.percentage >= 10 && stats.percentage < 50 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚡ <strong>Bon progrès :</strong> Concentrez-vous sur une génération à la fois pour optimiser vos captures !
                </p>
              </div>
            )}
            
            {stats.percentage >= 50 && stats.percentage < 90 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  🌟 <strong>Excellent travail :</strong> Vous êtes un vrai collectionneur ! Continuez pour atteindre les 90% !
                </p>
              </div>
            )}
            
            {stats.percentage >= 90 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-purple-800 text-sm">
                  👑 <strong>Maître Pokémon :</strong> Incroyable ! Vous êtes proche de compléter votre Living Dex Shiny !
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}