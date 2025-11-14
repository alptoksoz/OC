"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Car, Home, PlusSquare, User, LogOut, Search, Bookmark, Compass, Bell } from "lucide-react"

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (session) {
      fetchUnreadCount()
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications/unread")
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count)
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
            <Car className="w-6 h-6 text-blue-500" />
            <span>CarShare</span>
          </Link>

          {/* Search */}
          {session && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cars, brands, models..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </form>
          )}

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            {session ? (
              <>
                <Link href="/" className="text-gray-700 hover:text-blue-500 transition">
                  <Home className="w-6 h-6" />
                </Link>
                <Link href="/explore" className="text-gray-700 hover:text-blue-500 transition">
                  <Compass className="w-6 h-6" />
                </Link>
                <Link href="/create" className="text-gray-700 hover:text-blue-500 transition">
                  <PlusSquare className="w-6 h-6" />
                </Link>
                <Link href="/notifications" className="text-gray-700 hover:text-blue-500 transition relative">
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/saved" className="text-gray-700 hover:text-blue-500 transition">
                  <Bookmark className="w-6 h-6" />
                </Link>
                <Link
                  href={`/profile/${session.user?.email}`}
                  className="text-gray-700 hover:text-blue-500 transition"
                >
                  <User className="w-6 h-6" />
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-gray-700 hover:text-red-500 transition"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-500 font-medium transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
