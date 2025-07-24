import Link from 'next/link'

interface Category {
  id: number
  name: string
  icon: string
  count: number
  color: string
}

interface CategoryCardProps {
  category: Category
  size?: 'small' | 'medium' | 'large'
  variant?: 'grid' | 'list'
}

export default function CategoryCard({ 
  category, 
  size = 'medium',
  variant = 'grid' 
}: CategoryCardProps) {
  // Size classes
  const sizeClasses = {
    small: 'p-4 rounded-2xl',
    medium: 'p-8 rounded-3xl', 
    large: 'p-12 rounded-3xl'
  }

  const iconSizes = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl'
  }

  const textSizes = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-2xl'
  }

  if (variant === 'list') {
    return (
      <Link href={`/category/${category.name.toLowerCase().replace(' & ', '-').replace(' ', '-')}`}>
        <div className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-pink-100 hover:border-pink-300">
          <div className="flex items-center p-6 space-x-4">
            {/* Icon */}
            <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-2xl">{category.icon}</span>
            </div>
            
            {/* Category Info */}
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-pink-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-gray-500 text-sm">
                {category.count.toLocaleString()} items available
              </p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 transform group-hover:translate-x-2 transition-transform duration-300">
              <svg className="w-6 h-6 text-gray-400 group-hover:text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/category/${category.name.toLowerCase().replace(' & ', '-').replace(' ', '-')}`}>
      <div className="group cursor-pointer">
        <div className={`relative bg-gradient-to-br ${category.color} ${sizeClasses[size]} shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 overflow-hidden`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Floating Circles */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200"></div>
          
          {/* Icon */}
          <div className="text-center mb-4">
            <span className={`${iconSizes[size]} mb-3 block transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
              {category.icon}
            </span>
          </div>
          
          {/* Category Info */}
          <div className="text-center relative z-10">
            <h3 className={`font-bold text-white ${textSizes[size]} mb-2 group-hover:text-yellow-100 transition-colors duration-300`}>
              {category.name}
            </h3>
            <p className="text-white/80 text-sm font-medium transform group-hover:scale-105 transition-transform duration-300">
              {category.count.toLocaleString()} items
            </p>
            
            {/* Shop Now Button - appears on hover */}
            <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100">
              <span className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition-colors">
                Shop Now
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>

          {/* Shimmer Effect */}
          <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500"></div>
        </div>
      </div>
    </Link>
  )
}