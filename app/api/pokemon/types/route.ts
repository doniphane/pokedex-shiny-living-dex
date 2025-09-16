import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get all unique types from the database
    const pokemon = await prisma.pokemon.findMany({
      select: { types: true }
    })

    const typesSet = new Set<string>()

    pokemon.forEach(p => {
      if (Array.isArray(p.types)) {
        p.types.forEach((typeObj: any) => {
          if (typeObj.type && typeObj.type.name) {
            typesSet.add(typeObj.type.name)
          }
        })
      }
    })

    const types = Array.from(typesSet).sort()

    return NextResponse.json({ types })

  } catch (error) {
    console.error('Error fetching Pokemon types:', error)
    return NextResponse.json(
      { error: 'Error fetching Pokemon types' },
      { status: 500 }
    )
  }
}

// Get Pokemon by type
export async function POST(request: NextRequest) {
  try {
    const { type, page = 1, limit = 20 } = await request.json()

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    // Use raw SQL for JSON array search in PostgreSQL
    const pokemon = await prisma.$queryRaw`
      SELECT * FROM pokemon
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements(types) AS t
        WHERE t->>'type'->>'name' = ${type.toLowerCase()}
      )
      ORDER BY id ASC
      LIMIT ${limit} OFFSET ${skip}
    `

    const totalCount = await prisma.$queryRaw`
      SELECT COUNT(*) FROM pokemon
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements(types) AS t
        WHERE t->>'type'->>'name' = ${type.toLowerCase()}
      )
    `

    const count = Array.isArray(totalCount) ? Number(totalCount[0]?.count || 0) : 0
    const totalPages = Math.ceil(count / limit)

    return NextResponse.json({
      type,
      pokemon,
      pagination: {
        page,
        limit,
        totalCount: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching Pokemon by type:', error)
    return NextResponse.json(
      { error: 'Error fetching Pokemon by type' },
      { status: 500 }
    )
  }
}