interface SortProps {
  sortBy: string
  onSortChange: (sortBy: string) => void
  totalProducts: number
}

export default function ProductSort({ sortBy, onSortChange, totalProducts }: SortProps) {
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviews' }
  ]

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
      {/* Results Info */}
      <div className="flex items-center">
        <h2 className="text-2xl font-bold text-gray-800 mr-4">
          All Products
        </h2>
        <span className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 px-4 py-2 rounded-full text-sm font-semibold">
          {totalProducts.toLocaleString()} items found
        </span>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-4">
        <span className="text-gray-600 font-medium whitespace-nowrap">Sort by:</span>
        
        {/* Desktop Dropdown */}
        <div className="relative hidden lg:block">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-white border-2 border-pink-200 rounded-xl px-6 py-3 pr-12 text-gray-700 font-medium focus:border-pink-400 focus:outline-none cursor-pointer hover:border-pink-300 transition-colors appearance-none min-w-[200px]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Mobile Sort Buttons */}
        <div className="flex lg:hidden flex-wrap gap-2">
          {sortOptions.slice(0, 3).map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                sortBy === option.value
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="hidden lg:flex items-center bg-gray-100 rounded-xl p-1">
          <button className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}