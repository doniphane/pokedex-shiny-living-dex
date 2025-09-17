import { Sparkles, Target, Trophy } from 'lucide-react'
import { LivingDexClient } from '@/components/living-dex-client'
import { TOTAL_POKEMON } from '@/lib/pokemon-constants'

export const runtime = 'nodejs'

export default async function LivingDexPage() {
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
      </div>

      <LivingDexClient totalAvailable={TOTAL_POKEMON} />
    </main>
  )
}