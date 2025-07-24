'use client'

import { useState } from 'react'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  // If only one image, create variations for demo
  const galleryImages = images.length > 1 ? images : [
    images[0],
    images[0] + '?variant=1',
    images[0] + '?variant=2',
    images[0] + '?variant=3'
  ]

  const handleImageChange = (index: number) => {
    setSelectedImage(index)
    setIsZoomed(false)
  }

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-6">
      {/* Main Image */}
      <div className="relative group">
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 to-purple-50 aspect-square transition-all duration-500 ${
          isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
        }`}>
          <img
            src={galleryImages[selectedImage]}
            alt={`${productName} - Image ${selectedImage + 1}`}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isZoomed ? 'scale-150' : 'scale-100 group-hover:scale-110'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />
          
          {/* Navigation Arrows */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Zoom Indicator */}
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
            {isZoomed ? 'Click to zoom out' : 'Click to zoom in'}
          </div>

          {/* Image Counter */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
              {selectedImage + 1} / {galleryImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Images */}
      {galleryImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageChange(index)}
              className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 ${
                selectedImage === index
                  ? 'ring-4 ring-pink-500 ring-offset-2 scale-105'
                  : 'hover:scale-105 hover:shadow-lg'
              }`}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Active Overlay */}
              {selectedImage === index && (
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="flex-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 py-4 px-6 rounded-2xl font-semibold hover:from-pink-200 hover:to-purple-200 transition-all duration-300 flex items-center justify-center gap-3 group">
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Add to Wishlist
        </button>
        
        <button className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 py-4 px-6 rounded-2xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 flex items-center justify-center gap-3 group">
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          Share
        </button>
      </div>
    </div>
  )
}