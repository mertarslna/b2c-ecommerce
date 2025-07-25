// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeProductCount = searchParams.get('includeCount') === 'true'
    
    // ✅✅✅ التعديل هنا: يجب أن يكون المعامل true ليُفلتّر الفئات الرئيسية
    const fetchTopLevelOnly = searchParams.get('parentOnly') === 'true' 

    // Build where clause
    const where: any = {}
    if (fetchTopLevelOnly) { // ✅ استخدم المتغير الجديد هنا
      where.parent_id = null // Only top-level categories
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

    // Transform data with correct counts
    const transformedCategories = categories.map(category => {
      let totalProductCount = category.products?.length || 0
      
      if (category.children && category.children.length > 0) {
        const childrenCount = category.children.reduce((sum, child) => 
          sum + (child.products?.length || 0), 0
        )
        totalProductCount += childrenCount
      }

      return {
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
        productCount: includeProductCount ? totalProductCount : undefined,
        hasChildren: category.children.length > 0
      }
    })

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

// ... بقية كود الـ POST أو أي دالات أخرى في نفس الملف ...