// components/SimpleStarDisplay.tsx - لعرض النجوم بدون تفاعل
'use client'

interface SimpleStarDisplayProps {
  rating: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showRating?: boolean
  reviewCount?: number
  className?: string
}

export default function SimpleStarDisplay({
  rating,
  size = 'sm',
  showRating = false,
  reviewCount,
  className = ''
}: SimpleStarDisplayProps) {
  
  const sizeClasses = {
    xs: 'w-3 h-3',   // 12px
    sm: 'w-4 h-4',   // 16px  
    md: 'w-5 h-5',   // 20px
    lg: 'w-6 h-6'    // 24px
  }

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm', 
    md: 'text-sm',
    lg: 'text-base'
  }

  const starSize = sizeClasses[size]
  const textSize = textSizes[size]
  const safeRating = Math.max(0, Math.min(5, rating || 0))

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* النجوم */}
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((starNumber) => {
          const isFilled = starNumber <= safeRating
          
          return (
            <svg
              key={starNumber}
              className={`${starSize} ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          )
        })}
      </div>

      {/* عرض التقييم والعدد */}
      {(showRating || reviewCount !== undefined) && (
        <div className={`flex items-center gap-1 ${textSize} text-gray-600`}>
          {showRating && (
            <span className="font-medium">
              {safeRating.toFixed(1)}
            </span>
          )}
          {reviewCount !== undefined && (
            <span className="text-gray-500">
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </div>
      )}
    </div>
  )
}