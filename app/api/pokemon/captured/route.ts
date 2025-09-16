import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('user_session')

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const user = JSON.parse(sessionCookie.value)

    // Récupérer tous les Pokémon capturés par l'utilisateur
    const capturedPokemon = await prisma.capturedPokemon.findMany({
      where: { userId: user.id },
      orderBy: { capturedAt: 'desc' }
    })

    // Transformer les données au format attendu par le frontend
    const pokemonList = capturedPokemon.map(pokemon => ({
      id: pokemon.pokemonId,
      name: pokemon.pokemonName,
      sprites: {
        other: {
          "official-artwork": {
            front_default: pokemon.pokemonImage
          }
        }
      },
      types: pokemon.pokemonTypes,
      isShiny: true
    }))

    return NextResponse.json({ pokemon: pokemonList })

  } catch (error) {
    console.error('Erreur lors de la récupération des Pokémon:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}