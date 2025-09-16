import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
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
    const { pokemon } = await request.json()

    // Vérifier si le Pokémon est déjà capturé
    const existingCapture = await prisma.capturedPokemon.findFirst({
      where: {
        userId: user.id,
        pokemonId: pokemon.id
      }
    })

    if (existingCapture) {
      return NextResponse.json(
        { error: 'Pokémon déjà capturé' },
        { status: 400 }
      )
    }

    // Capturer le Pokémon
    const capturedPokemon = await prisma.capturedPokemon.create({
      data: {
        userId: user.id,
        pokemonId: pokemon.id,
        pokemonName: pokemon.name,
        pokemonImage: pokemon.sprites.other["official-artwork"].front_default,
        pokemonTypes: pokemon.types
      }
    })

    return NextResponse.json({
      success: true,
      pokemon: capturedPokemon
    })

  } catch (error) {
    console.error('Erreur lors de la capture:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}