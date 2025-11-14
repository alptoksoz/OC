import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import PostCard from "@/components/posts/PostCard"
import TrendingHashtags from "@/components/widgets/TrendingHashtags"
import Link from "next/link"

export default async function ExplorePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user?.email! },
  })

  // Fetch trending posts (most liked in last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const trendingPosts = await prisma.post.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          image: true,
        },
      },
      likes: true,
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      likes: {
        _count: "desc",
      },
    },
    take: 10,
  })

  // Fetch popular users (most followers)
  const popularUsers = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          followers: true,
          posts: true,
        },
      },
    },
    orderBy: {
      followers: {
        _count: "desc",
      },
    },
    take: 5,
  })

  // Fetch latest posts
  const latestPosts = await prisma.post.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          image: true,
        },
      },
      likes: true,
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  })

  // Fetch trending hashtags
  const allPosts = await prisma.post.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      hashtags: true,
    },
  })

  // Count hashtags
  const hashtagCounts = new Map<string, number>()
  allPosts.forEach((post) => {
    post.hashtags.forEach((tag) => {
      hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1)
    })
  })

  // Sort and get top 10 trending hashtags
  const trendingHashtags = Array.from(hashtagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Explore</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Popular Users */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Popular Users</h2>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="space-y-4">
                {popularUsers.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.username || user.email}`}
                    className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {user.name?.[0] || user.email[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{user.name || user.username}</p>
                        <p className="text-sm text-gray-500">
                          {user._count.posts} posts • {user._count.followers} followers
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Trending Hashtags */}
          <div>
            <h2 className="text-xl font-bold mb-4">&nbsp;</h2>
            <TrendingHashtags hashtags={trendingHashtags} />
          </div>
        </div>

        {/* Trending Posts */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Trending This Week</h2>
          {trendingPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              No trending posts this week
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingPosts.map((post) => (
                <PostCard key={post.id} post={post as any} currentUserId={currentUser?.id} />
              ))}
            </div>
          )}
        </div>

        {/* Latest Posts */}
        <div>
          <h2 className="text-xl font-bold mb-4">Latest Posts</h2>
          {latestPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              No posts yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestPosts.map((post) => (
                <PostCard key={post.id} post={post as any} currentUserId={currentUser?.id} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
