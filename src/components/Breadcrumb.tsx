import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <div className="flex items-center space-x-2">
        {/* Home Icon */}
        <Link 
          href="/" 
          className="text-gray-500 hover:text-pink-600 transition-colors duration-200 group"
        >
          <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </Link>

        {/* Breadcrumb Items */}
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            {/* Separator */}
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>

            {/* Breadcrumb Item */}
            {item.href && !item.active ? (
              <Link 
                href={item.href}
                className="text-gray-600 hover:text-pink-600 transition-colors duration-200 hover:underline font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className={`font-medium ${
                  item.active 
                    ? 'text-pink-600 bg-pink-50 px-3 py-1 rounded-full' 
                    : 'text-gray-800'
                }`}
              >
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}

// Alternative compact version
export function CompactBreadcrumb({ items, className = '' }: BreadcrumbProps) {
  const lastItem = items[items.length - 1]
  const previousItems = items.slice(0, -1)

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      {/* Home */}
      <Link href="/" className="text-gray-500 hover:text-pink-600 transition-colors">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      </Link>

      {/* Separator */}
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>

      {/* Show dots if more than 2 items */}
      {previousItems.length > 1 && (
        <>
          <button className="text-gray-500 hover:text-pink-600 px-2 py-1 rounded transition-colors">
            ...
          </button>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </>
      )}

      {/* Current page */}
      <span className="text-pink-600 font-medium bg-pink-50 px-3 py-1 rounded-full">
        {lastItem.label}
      </span>
    </nav>
  )
}