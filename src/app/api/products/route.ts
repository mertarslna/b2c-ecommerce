// app/api/products/route.ts - FIXED WITH REAL REVIEW DATA
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const rating = searchParams.get('rating')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    console.log('🔍 Products API - Filters:', {
      category, minPrice, maxPrice, rating, search, sortBy, sortOrder
    })

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      is_approved: true,
    }

    // Category filter
    if (category && category !== 'all') {
      where.category = {
        OR: [
          {
            name: {
              equals: category,
              mode: 'insensitive'
            }
          },
          {
            parent: {
              name: {
                equals: category,
                mode: 'insensitive'
              }
            }
          }
        ]
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    // Rating filter - 🔧 استخدام التقييم الفعلي من قاعدة البيانات
    if (rating) {
      where.rating = {
        gte: parseInt(rating)
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'price') {
      orderBy.price = sortOrder
    } else if (sortBy === 'rating') {
      orderBy.rating = sortOrder
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else {
      orderBy.created_at = sortOrder
    }

    // 🔧 FIXED: Fetch products with REAL review data
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          images: {
            where: {
              is_main: true
            },
            select: {
              path: true
            }
          },
          // 🔧 CRITICAL: Include actual reviews with rating calculation
          reviews: {
            where: {
              is_approved: true
            },
            select: {
              id: true,
              rating: true
            }
          },
          seller: {
            include: {
              user: {
                select: {
                  first_name: true,
                  last_name: true
                }
              }
            }
          }
        }
      }),
      prisma.product.count({ where })
    ])

    console.log('📊 Fetched products:', products.length)

    // 🔧 FIXED: Transform data with REAL ratings and review counts
    const transformedProducts = products.map(product => {
      // Calculate REAL average rating and review count
      const approvedReviews = product.reviews.filter(r => r.rating != null)
      const reviewCount = approvedReviews.length
      
      let avgRating = 0
      if (reviewCount > 0) {
        // Calculate from actual reviews
        avgRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      } else {
        // Fallback to product rating if no reviews
        avgRating = parseFloat(product.rating?.toString() || '0')
      }

      console.log(`📊 Product ${product.name}: ${reviewCount} reviews, avg rating: ${avgRating.toFixed(1)}`)

      return {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price.toString()),
        originalPrice: null,
        image: product.images[0]?.path || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
        category: product.category.name,
        // 🔧 REAL rating rounded to 1 decimal place
        rating: Math.round(avgRating * 10) / 10,
        // 🔧 REAL review count
        reviews: reviewCount,
        description: product.description,
        stock: product.stock,
        seller: {
          name: `${product.seller.user.first_name} ${product.seller.user.last_name}`,
          businessName: product.seller.business_name
        }
      }
    })

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    console.log('✅ Products API - Success:', {
      productsCount: transformedProducts.length,
      totalCount,
      currentPage: page,
      totalPages
    })

    return NextResponse.json({
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage
        }
      }
    })

  } catch (error) {
    console.error('❌ Products API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// POST - Create new product (same as before)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      price, 
      stock, 
      category_id, 
      seller_id,
      images 
    } = body

    // Validate required fields
    if (!name || !description || !price || !category_id || !seller_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields' 
        },
        { status: 400 }
      )
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        category_id,
        seller_id,
        is_approved: false,
      },
      include: {
        category: true,
        seller: {
          include: {
            user: true
          }
        }
      }
    })

    // Create images if provided
    if (images && images.length > 0) {
      await prisma.image.createMany({
        data: images.map((image: any, index: number) => ({
          product_id: product.id,
          path: image.path,
          size: image.size || null,
          format: image.format || null,
          is_main: index === 0,
        }))
      })
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully. Awaiting admin approval.'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Create Product Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create product',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}