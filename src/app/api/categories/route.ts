// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeProductCount = searchParams.get('includeCount') === 'true'
    const parentOnly = searchParams.get('parentOnly') === 'true'

    // Build where clause
    const where: any = {}
    if (parentOnly) {
      where.parent_id = null // Only parent categories
    }

    // Fetch categories
    const categories = await prisma.category.findMany({
      where,
      include: {
        children: {
          include: {
            ...(includeProductCount && {
              products: {
                where: {
                  is_approved: true
                },
                select: {
                  id: true
                }
              }
            })
          }
        },
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        ...(includeProductCount && {
          products: {
            where: {
              is_approved: true
            },
            select: {
              id: true
            }
          }
        })
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Transform data
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      parent: category.parent,
      children: category.children.map(child => ({
        id: child.id,
        name: child.name,
        description: child.description,
        productCount: includeProductCount ? child.products?.length || 0 : undefined
      })),
      productCount: includeProductCount ? category.products?.length || 0 : undefined,
      hasChildren: category.children.length > 0
    }))

    return NextResponse.json({
      success: true,
      data: transformedCategories
    })

  } catch (error) {
    console.error('Categories API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch categories',
        message: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// POST - Create new category (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, parent_id } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Check if category name already exists at the same level
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        parent_id: parent_id || null
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category name already exists at this level' },
        { status: 409 }
      )
    }

    // If parent_id is provided, verify parent exists
    if (parent_id) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parent_id }
      })

      if (!parentCategory) {
        return NextResponse.json(
          { success: false, error: 'Parent category not found' },
          { status: 404 }
        )
      }
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        description,
        parent_id: parent_id || null
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create Category Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create category',
        message: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      },
      { status: 500 }
    )
  }
}