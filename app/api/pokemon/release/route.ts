import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

export async function DELETE(request: NextRequest) {
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
    const { pokemonId } = await request.json()

    // Supprimer le Pokémon capturé
    await prisma.capturedPokemon.deleteMany({
      where: {
        userId: user.id,
        pokemonId: pokemonId
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur lors de la libération:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}