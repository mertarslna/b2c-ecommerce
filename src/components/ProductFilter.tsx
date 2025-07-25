'use client'

import React, { useState } from 'react'

interface Category {
  id: string
  name: string
  description?: string
  parent?: {
    id: string
    name: string
  }
  children: {
    id: string
    name: string
    description?: string
    productCount?: number
  }[]
  productCount?: number
  hasChildren: boolean
}

interface FilterProps {
  categories: Category[] | string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  priceRange: [number, number]
  onPriceChange: (range: [number, number]) => void
  selectedRating: number
  onRatingChange: (rating: number) => void
}

export default function ProductFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  selectedRating,
  onRatingChange
}: FilterProps) {
  const ratings = [5, 4, 3, 2, 1]
  
  // State for expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // تحويل البيانات حسب النوع المرسل
  const categoriesData: Category[] = React.useMemo(() => {
    if (!categories || categories.length === 0) return []
    
    // فحص إذا كانت البيانات من نوع string[]
    if (typeof categories[0] === 'string') {
      return (categories as string[]).map((name, index) => ({
        id: `cat-${index}`,
        name,
        description: '',
        parent: undefined,
        children: [],
        productCount: undefined,
        hasChildren: false
      }))
    }
    
    return categories as Category[]
  }, [categories])
  
  // Filter for parent categories only
  const parentCategories = categoriesData?.filter(category => 
    category && category.name && (!category.parent || !category.parent.id)
  ) || []

  // Enhanced: Helper function to get emoji for categories
  const getCategoryEmoji = (categoryName: string) => {
    if (!categoryName) return '📦'
    
    const emojiMap: { [key: string]: string } = {
      'Electronics': '📱',
      'Clothing': '👗',
      'Smartphones': '📱',
      'Laptops': '💻',
      'Home & Living': '🏠',
      'Apparel & Fashion': '👕',
      'Health & Beauty': '💖',
      'Sports & Outdoors': '🏅',
      'Books': '📚',
      'Toys & Games': '🎮',
      'Automotive': '🚗',
      'Food & Beverages': '🍔',
      'Jewelry': '💎',
      'Music & Movies': '🎵',
      'Garden & Outdoor': '🌱'
    }
    return emojiMap[categoryName] || '📦'
  }

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-6 border border-pink-100">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6">
        Filters
      </h3>

      {/* Professional Category Filter with Expandable Categories */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
          Categories
        </h4>
        
        <div className="space-y-1">
          {/* All Categories Option */}
          <label className="flex items-center group cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="category"
              value=""
              checked={selectedCategory === ''}
              onChange={() => onCategoryChange('')}
              className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 focus:ring-2"
            />
            <span className="ml-3 text-gray-700 group-hover:text-pink-600 transition-colors font-medium">
              All Categories
            </span>
          </label>

          {/* Parent Categories with Professional Expand/Collapse */}
          {parentCategories.length > 0 ? (
            parentCategories.map((category) => {
              if (!category || !category.name) return null
              
              const hasChildren = category.hasChildren && category.children && category.children.length > 0
              const isExpanded = expandedCategories.has(category.id)
              
              return (
                <div key={category.id} className="border border-gray-100 rounded-lg overflow-hidden">
                  {/* Parent Category */}
                  <div className="flex items-center p-3 bg-gray-50/50 hover:bg-gray-100/70 transition-colors">
                    <label className="flex items-center flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category.name}
                        checked={selectedCategory === category.name}
                        onChange={() => onCategoryChange(category.name)}
                        className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 focus:ring-2"
                      />
                      <span className="ml-3 text-gray-700 font-medium flex items-center">
                        <span className="mr-2">{getCategoryEmoji(category.name)}</span>
                        <span>{category.name}</span>
                        {category.productCount !== undefined && category.productCount > 0 && (
                          <span className="ml-2 text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
                            {category.productCount}
                          </span>
                        )}
                      </span>
                    </label>
                    
                    {/* Professional Expand/Collapse Arrow */}
                    {hasChildren && (
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="p-1 ml-2 hover:bg-gray-200 rounded-full transition-colors"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        <svg 
                          className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                            isExpanded ? 'rotate-90' : 'rotate-0'
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Sub-categories - Smooth Expand/Collapse */}
                  {hasChildren && (
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="bg-white border-t border-gray-100">
                        {category.children.map((subCategory, index) => {
                          if (!subCategory || !subCategory.name) return null
                          
                          return (
                            <label 
                              key={subCategory.id} 
                              className={`flex items-center justify-between p-3 pl-12 cursor-pointer hover:bg-gray-50 transition-colors group ${
                                index !== category.children.length - 1 ? 'border-b border-gray-50' : ''
                              }`}
                            >
                              <div className="flex items-center flex-1">
                                <input
                                  type="radio"
                                  name="category"
                                  value={subCategory.name}
                                  checked={selectedCategory === subCategory.name}
                                  onChange={() => onCategoryChange(subCategory.name)}
                                  className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 focus:ring-2"
                                />
                                <div className="ml-3 flex items-center">
                                  <span className="w-1.5 h-1.5 bg-pink-300 rounded-full mr-3 group-hover:bg-pink-500 transition-colors" />
                                  <div>
                                    <span className="text-sm text-gray-700 group-hover:text-pink-600 transition-colors">
                                      {subCategory.name}
                                    </span>
                                    {subCategory.description && (
                                      <div className="text-xs text-gray-400 mt-1">
                                        {subCategory.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {subCategory.productCount !== undefined && subCategory.productCount > 0 && (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors">
                                  {subCategory.productCount}
                                </span>
                              )}
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-gray-500 text-sm italic p-4 text-center bg-gray-50 rounded-lg">
              No categories available
            </div>
          )}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
          Price Range
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
          <input
            type="range"
            min="0"
            max="2000"
            value={priceRange[1]}
            onChange={(e) => onPriceChange([priceRange[0], parseInt(e.target.value)])}
            className="w-full h-2 bg-gradient-to-r from-pink-200 to-purple-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Min Price</label>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => onPriceChange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                placeholder="$0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Max Price</label>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => onPriceChange([priceRange[0], parseInt(e.target.value) || 2000])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                placeholder="$2000"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Rating Filter */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
          Customer Rating
        </h4>
        <div className="space-y-3">
          <label className="flex items-center group cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="rating"
              value={0}
              checked={selectedRating === 0}
              onChange={() => onRatingChange(0)}
              className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 focus:ring-2"
            />
            <span className="ml-3 text-gray-700 group-hover:text-pink-600 transition-colors">
              All Ratings
            </span>
          </label>
          {ratings.map((rating) => (
            <label key={rating} className="flex items-center group cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={selectedRating === rating}
                onChange={() => onRatingChange(rating)}
                className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 focus:ring-2"
              />
              <div className="ml-3 flex items-center">
                <div className="flex mr-2">
                  {[...Array(rating)].map((_, i) => (
                    <span key={i} className="text-sm text-yellow-400">
                      ⭐
                    </span>
                  ))}
                </div>
                {rating < 5 && (
                  <span className="text-gray-700 group-hover:text-pink-600 transition-colors">
                    & above
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={() => {
          onCategoryChange('')
          onPriceChange([0, 2000])
          onRatingChange(0)
          setExpandedCategories(new Set()) // إغلاق جميع الفئات المفتوحة
        }}
        className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:from-pink-100 hover:to-purple-100 hover:text-pink-600 transition-all duration-300 font-semibold border border-gray-200 hover:border-pink-300"
      >
        Clear All Filters
      </button>

      {/* Custom Styles for smooth animations */}
      <style jsx>{`
        /* Custom radio button styles - Pink Theme */
        input[type="radio"] {
          appearance: none;
          width: 1rem;
          height: 1rem;
          border: 2px solid #d1d5db;
          border-radius: 50%;
          background-color: white;
          transition: all 0.2s ease-in-out;
        }
        
        input[type="radio"]:checked {
          background-color: #ec4899;
          border-color: #ec4899;
          box-shadow: 0 0 0 2px white, 0 0 0 4px #ec4899;
        }
        
        input[type="radio"]:focus {
          outline: none;
          border-color: #ec4899;
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
        }
        
        input[type="radio"]:hover {
          border-color: #ec4899;
        }
        
        /* Add a pink dot in the center when checked */
        input[type="radio"]:checked::before {
          content: '';
          display: block;
          width: 0px;
          height: 6px;
          border-radius: 50%;
          background-color: white;
          margin: 1px auto;
        }
        
        /* Smooth transitions for all interactive elements */
        .transition-colors {
          transition: all 0.2s ease-in-out;
        }
        
        /* Enhanced hover effects */
        .group:hover .group-hover\\:bg-pink-500 {
          background-color: #ec4899;
        }
        
        .group:hover .group-hover\\:text-pink-600 {
          color: #dc2626;
        }
        
        /* Focus states for accessibility */
        button:focus {
          outline: 2px solid #ec4899;
          outline-offset: 2px;
        }
        
        /* Enhanced button styles */
        button:focus-visible {
          outline: 2px solid #ec4899;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  )
}