"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, X } from "lucide-react"

export default function PostFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    brand: searchParams.get("brand") || "",
    model: searchParams.get("model") || "",
    yearFrom: searchParams.get("yearFrom") || "",
    yearTo: searchParams.get("yearTo") || "",
  })

  const handleApplyFilters = () => {
    const params = new URLSearchParams()

    if (filters.brand) params.set("brand", filters.brand)
    if (filters.model) params.set("model", filters.model)
    if (filters.yearFrom) params.set("yearFrom", filters.yearFrom)
    if (filters.yearTo) params.set("yearTo", filters.yearTo)

    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}` : "/")
  }

  const handleClearFilters = () => {
    setFilters({
      brand: "",
      model: "",
      yearFrom: "",
      yearTo: "",
    })
    router.push("/")
  }

  const hasActiveFilters = filters.brand || filters.model || filters.yearFrom || filters.yearTo

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <span className="font-semibold">Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        <span className="text-gray-500">{showFilters ? "−" : "+"}</span>
      </button>

      {showFilters && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>
              <input
                type="text"
                value={filters.brand}
                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                placeholder="e.g., BMW, Mercedes"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <input
                type="text"
                value={filters.model}
                onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                placeholder="e.g., M3, C-Class"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Year From</label>
              <input
                type="number"
                value={filters.yearFrom}
                onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
                placeholder="1990"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Year To</label>
              <input
                type="number"
                value={filters.yearTo}
                onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
                placeholder={new Date().getFullYear().toString()}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApplyFilters}
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition"
            >
              Apply Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
