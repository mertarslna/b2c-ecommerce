interface FilterProps {
  categories: string[]
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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-6 border border-pink-100">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6">
        Filters
      </h3>

      {/* Category Filter */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
          Categories
        </h4>
        <div className="space-y-3">
          <label className="flex items-center group cursor-pointer">
            <input
              type="radio"
              name="category"
              value=""
              checked={selectedCategory === ''}
              onChange={() => onCategoryChange('')}
              className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500"
            />
            <span className="ml-3 text-gray-700 group-hover:text-pink-600 transition-colors">
              All Categories
            </span>
          </label>
          {categories.map((category) => (
            <label key={category} className="flex items-center group cursor-pointer">
              <input
                type="radio"
                name="category"
                value={category}
                checked={selectedCategory === category}
                onChange={() => onCategoryChange(category)}
                className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500"
              />
              <span className="ml-3 text-gray-700 group-hover:text-pink-600 transition-colors capitalize">
                {category}
              </span>
            </label>
          ))}
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
            className="w-full h-2 bg-gradient-to-r from-pink-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
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
          <label className="flex items-center group cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={0}
              checked={selectedRating === 0}
              onChange={() => onRatingChange(0)}
              className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500"
            />
            <span className="ml-3 text-gray-700 group-hover:text-pink-600 transition-colors">
              All Ratings
            </span>
          </label>
          {ratings.map((rating) => (
            <label key={rating} className="flex items-center group cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={selectedRating === rating}
                onChange={() => onRatingChange(rating)}
                className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500"
              />
              <div className="ml-3 flex items-center">
                <div className="flex mr-2">
                  {/* Render 'rating' number of yellow stars */}
                  {[...Array(rating)].map((_, i) => (
                    <span key={i} className="text-sm text-yellow-400">
                      ⭐
                    </span>
                  ))}
                </div>
                {/* Sadece 5 yıldız için "& above" eklemiyoruz */}
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
        }}
        className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:from-pink-100 hover:to-purple-100 hover:text-pink-600 transition-all duration-300 font-semibold border border-gray-200 hover:border-pink-300"
      >
        Clear All Filters
      </button>
    </div>
  )
}