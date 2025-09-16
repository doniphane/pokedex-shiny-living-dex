import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50) // Max 50 Pokemon par requête
    const offset = parseInt(searchParams.get('offset') || '0')
    const generation = searchParams.get('generation')
    const search = searchParams.get('search')
    const type = searchParams.get('type')

    const skip = offset || (page - 1) * limit

    // Build where clause
    let where: any = {}
    let rawWhere: string[] = []
    let params: any[] = []

    if (generation) {
      // Support multiple generations separated by comma
      const generations = generation.split(',').map(g => parseInt(g.trim())).filter(g => !isNaN(g))
      if (generations.length === 1) {
        where.generation = generations[0]
      } else if (generations.length > 1) {
        where.generation = { in: generations }
      }
    }

    if (search) {
      where.name = {
        contains: search.toLowerCase(),
        mode: 'insensitive'
      }
    }

    if (type) {
      // For type filtering, we need to use raw SQL due to complex JSON structure
      const typeQuery = `EXISTS (
        SELECT 1 FROM jsonb_array_elements(types) AS type_elem
        WHERE type_elem->'type'->>'name' = $${params.length + 1}
      )`
      rawWhere.push(typeQuery)
      params.push(type.toLowerCase())
    }

    // Get Pokemon with pagination
    let pokemon, totalCount;

    if (rawWhere.length > 0) {
      // Use raw SQL when we have complex JSON queries
      const whereClause = Object.keys(where).length > 0 ?
        `WHERE ${Object.keys(where).map((key, i) => {
          if (key === 'generation') {
            if (Array.isArray(where[key].in)) {
              return `generation IN (${where[key].in.join(',')})`
            } else {
              return `generation = ${where[key]}`
            }
          } else if (key === 'name') {
            return `LOWER(name) LIKE LOWER('%${where[key].contains}%')`
          }
          return ''
        }).filter(Boolean).concat(rawWhere).join(' AND ')}` :
        `WHERE ${rawWhere.join(' AND ')}`

      const [pokemonResult, countResult] = await Promise.all([
        prisma.$queryRawUnsafe(`
          SELECT * FROM pokemon
          ${whereClause}
          ORDER BY id ASC
          LIMIT ${limit} OFFSET ${skip}
        `, ...params),
        prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as count FROM pokemon
          ${whereClause}
        `, ...params)
      ])

      pokemon = pokemonResult
      totalCount = parseInt((countResult as any)[0].count)
    } else {
      // Use regular Prisma queries for simple cases
      const [pokemonResult, countResult] = await Promise.all([
        prisma.pokemon.findMany({
          where,
          skip,
          take: limit,
          orderBy: { id: 'asc' }
        }),
        prisma.pokemon.count({ where })
      ])

      pokemon = pokemonResult
      totalCount = countResult
    }

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
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
    console.error('Error fetching Pokemon:', error)
    return NextResponse.json(
      { error: 'Error fetching Pokemon' },
      { status: 500 }
    )
  }
}