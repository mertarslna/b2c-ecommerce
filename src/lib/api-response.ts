// src/lib/api-response.ts
import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message
  }, { status: 200 })
}

export function createdResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message
  }, { status: 201 })
}

export function errorResponse(error: string, status: number = 400): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    error
  }, { status })
}

export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    error: 'Unauthorized access'
  }, { status: 401 })
}

export function notFoundResponse(resource: string = 'Resource'): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    error: `${resource} not found`
  }, { status: 404 })
}

export function serverErrorResponse(error?: string): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    error: error || 'Internal server error'
  }, { status: 500 })
}