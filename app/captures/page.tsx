"use client"

import { usePokemon } from "@/context/pokemon-context"
import { useAuth } from "@/context/auth-context"
import { PokemonCard } from "@/components/pokemon-card"
import Link from "next/link"

export default function CapturesPage() {
  const { capturedPokemon, isLoading } = usePokemon()
  const { user, isLoading: authLoading } = useAuth()

  if (authLoading || isLoading) {
    return (
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-bounce w-16 h-16 bg-red-500 rounded-full"></div>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold mb-8">Mes Pokémon Shiny Capturés</h1>
          <p className="text-xl mb-6">Vous devez vous connecter pour voir vos Pokémon capturés.</p>
          <Link href="/" className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors">
            Retourner à la Pokédex
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Mes Pokémon Shiny Capturés</h1>

      {capturedPokemon.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl mb-6">Vous n'avez pas encore capturé de Pokémon shiny.</p>
          <Link href="/" className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors">
            Retourner à la Pokédex
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {capturedPokemon.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon as any} showReleaseButton={true} />
          ))}
        </div>
      )}
    </main>
  )
}
