
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// CORS için OPTIONS endpoint
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };
  if (!userId) {
    return NextResponse.json({ success: false, error: 'userId parametresi gerekli' }, { status: 400, headers: corsHeaders })
  }
  try {
    // CustomerProfile id'si ile eşleşen siparişleri getir
    const customer = await prisma.customerProfile.findUnique({
      where: { user_id: userId },
      select: { id: true }
    })
    if (!customer) {
      return NextResponse.json({ success: true, data: [] }, { status: 200, headers: corsHeaders })
    }
    const orders = await prisma.order.findMany({
      where: { customer_id: customer.id },
      include: {
        order_items: {
          include: {
            product: {
              include: {
                images: {
                  where: { is_main: true },
                  take: 1
                }
              }
            }
          }
        },
        payments: true,
        shipping_address: true,
        billing_address: true
      },
      orderBy: { order_date: 'desc' }
    })
    // Frontend ile uyum için order_items -> items olarak map'le
    const mappedOrders = orders.map(order => ({
      ...order,
      items: order.order_items,
    }))
    return NextResponse.json({ success: true, data: mappedOrders }, { status: 200, headers: corsHeaders })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Veritabanı hatası', details: String(e) }, { status: 500, headers: corsHeaders })
  }
}

export async function POST(req: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };
  const body = await req.json()
  // Gerekli alanlar: userId, items, total
  if (!body.userId || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ success: false, error: 'Eksik sipariş bilgisi' }, { status: 400, headers: corsHeaders })
  }
  try {
    // Kullanıcıdan CustomerProfile id'sini bul
    const customer = await prisma.customerProfile.findUnique({
      where: { user_id: body.userId },
      select: { id: true }
    })
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Kullanıcı profili bulunamadı' }, { status: 404, headers: corsHeaders })
    }

    // Dummy adresler (geliştirme için, gerçek projede frontend'den alınmalı)
    const address = await prisma.address.findFirst({ where: { user_id: body.userId } })
    if (!address) {
      return NextResponse.json({ success: false, error: 'Kullanıcıya ait adres bulunamadı' }, { status: 400, headers: corsHeaders })
    }

    // Siparişi oluştur
    const order = await prisma.order.create({
      data: {
        customer_id: customer.id,
        total_amount: body.total,
        status: 'PENDING',
        shipping_address_id: address.id,
        billing_address_id: address.id,
        order_items: {
          create: body.items.map((item: any) => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: (item.price * item.quantity)
          }))
        }
      },
      include: {
        order_items: true
      }
    })
    return NextResponse.json({ success: true, data: order }, { status: 200, headers: corsHeaders })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Veritabanı hatası', details: String(e) }, { status: 500, headers: corsHeaders })
  }
}
