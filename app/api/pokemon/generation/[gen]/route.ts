import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gen: string }> }
) {
  try {
    const { gen } = await params
    const generation = parseInt(gen)

    if (isNaN(generation) || generation < 1 || generation > 9) {
      return NextResponse.json(
        { error: 'Invalid generation. Must be between 1 and 9' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = { generation }

    if (search) {
      where.name = {
        contains: search.toLowerCase(),
        mode: 'insensitive'
      }
    }

    // Get Pokemon with pagination
    const [pokemon, totalCount] = await Promise.all([
      prisma.pokemon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' }
      }),
      prisma.pokemon.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      generation,
      pokemon,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching Pokemon by generation:', error)
    return NextResponse.json(
      { error: 'Error fetching Pokemon by generation' },
      { status: 500 }
    )
  }
}