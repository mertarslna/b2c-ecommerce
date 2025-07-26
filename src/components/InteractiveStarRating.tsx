// components/InteractiveStarRating.tsx - FIXED SIZES
'use client'

import { useState } from 'react'

interface InteractiveStarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  readonly?: boolean
  showText?: boolean
  className?: string
}

export default function InteractiveStarRating({
  rating,
  onRatingChange,
  size = 'md',
  readonly = false,
  showText = false,
  className = ''
}: InteractiveStarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  // 🔧 أحجام أصغر ومعقولة
  const sizeClasses = {
    sm: 'w-4 h-4',      // 16px - صغير للتوزيع
    md: 'w-5 h-5',      // 20px - متوسط للعرض العادي  
    lg: 'w-6 h-6',      // 24px - كبير للملخص
    xl: 'w-8 h-8'       // 32px - للنموذج فقط
  }

  const starSize = sizeClasses[size]
  const interactive = !readonly && onRatingChange

  const handleStarClick = (starRating: number) => {
    if (interactive) {
      onRatingChange?.(starRating)
    }
  }

  const handleStarHover = (starRating: number) => {
    if (interactive) {
      setHoveredRating(starRating)
      setIsHovering(true)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setIsHovering(false)
      setHoveredRating(0)
    }
  }

  const displayRating = isHovering ? hoveredRating : rating
  const ratingTexts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className="flex items-center gap-1"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((starNumber) => {
          const isFilled = starNumber <= displayRating
          const isHovered = interactive && starNumber <= hoveredRating && isHovering
          
          return (
            <button
              key={starNumber}
              type="button"
              disabled={readonly}
              onClick={() => handleStarClick(starNumber)}
              onMouseEnter={() => handleStarHover(starNumber)}
              className={`
                ${starSize} 
                transition-all duration-200 ease-in-out
                ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                ${isFilled 
                  ? (isHovered ? 'text-yellow-400 drop-shadow-sm' : 'text-yellow-400') 
                  : 'text-gray-300'
                }
                ${interactive ? 'hover:text-yellow-400' : ''}
                ${readonly ? 'select-none' : ''}
                focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded
              `}
              aria-label={`Rate ${starNumber} star${starNumber > 1 ? 's' : ''}`}
            >
              {isFilled ? (
                // Filled star - نجمة ممتلئة
                <svg 
                  className="w-full h-full" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ) : (
                // Empty star - نجمة فارغة
                <svg 
                  className="w-full h-full" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              )}
            </button>
          )
        })}
      </div>

      {showText && (
        <div className="flex items-center gap-2 text-sm text-gray-600 ml-2">
          <span className="font-medium">{displayRating.toFixed(1)}</span>
          {interactive && isHovering && (
            <span className="text-gray-500">
              ({ratingTexts[hoveredRating]})
            </span>
          )}
        </div>
      )}
    </div>
  )
}