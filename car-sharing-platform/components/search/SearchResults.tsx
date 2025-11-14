"use client"

import { useState } from "react"
import Link from "next/link"
import PostCard from "@/components/posts/PostCard"
import EmptyState from "@/components/ui/EmptyState"
import { User as UserIcon, Search, FileText, Users } from "lucide-react"

interface SearchResultsProps {
  posts: any[]
  users: any[]
  currentUserId?: string
  query: string
}

export default function SearchResults({ posts, users, currentUserId, query }: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts")

  const totalResults = posts.length + users.length

  if (totalResults === 0) {
    return (
      <div className="bg-white rounded-lg">
        <EmptyState
          icon={Search}
          title="No results found"
          description={`No posts or users found for "${query}". Try searching for different keywords.`}
          actionLabel="Explore All Posts"
          actionHref="/explore"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 px-4 py-3 font-medium transition ${
              activeTab === "posts"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 px-4 py-3 font-medium transition ${
              activeTab === "users"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Users ({users.length})
          </button>
        </div>
      </div>

      {/* Posts tab */}
      {activeTab === "posts" && (
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg">
              <EmptyState
                icon={FileText}
                title="No posts found"
                description={`No posts found for "${query}". Try searching for different keywords or check the Users tab.`}
              />
            </div>
          ) : (
            <>
              <p className="text-gray-600">
                {posts.length} post{posts.length !== 1 ? "s" : ""} found
              </p>
              {posts.map((post) => (
                <PostCard key={post.id} post={post as any} currentUserId={currentUserId} />
              ))}
            </>
          )}
        </div>
      )}

      {/* Users tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="bg-white rounded-lg">
              <EmptyState
                icon={Users}
                title="No users found"
                description={`No users found for "${query}". Try searching for different keywords or check the Posts tab.`}
              />
            </div>
          ) : (
            <>
              <p className="text-gray-600">
                {users.length} user{users.length !== 1 ? "s" : ""} found
              </p>
              <div className="bg-white rounded-lg divide-y">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.username || user.email}`}
                    className="block p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || user.username}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {user.name?.[0] || user.email[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{user.name || user.username}</p>
                        <p className="text-sm text-gray-500">
                          @{user.username || user.email.split("@")[0]}
                        </p>
                        {user.bio && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{user.bio}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{user._count.posts} posts</span>
                          <span>{user._count.followers} followers</span>
                          <span>{user._count.following} following</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
