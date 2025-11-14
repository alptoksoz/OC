import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import PostCard from "@/components/posts/PostCard"
import SearchResults from "@/components/search/SearchResults"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const query = searchParams.q || ""

  let posts: any[] = []
  let users: any[] = []

  if (query.trim()) {
    // Search posts
    posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            carBrand: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            carModel: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            hashtags: {
              hasSome: [query.toLowerCase()],
            },
          },
        ],
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
        createdAt: "desc",
      },
    })

    // Search users
    users = await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            username: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
      take: 20,
    })
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user?.email! },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">
          {query ? `Search results for "${query}"` : "Search"}
        </h1>

        {!query.trim() ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">Enter a search term to find posts and users</p>
          </div>
        ) : (
          <SearchResults
            posts={posts}
            users={users}
            currentUserId={currentUser?.id}
            query={query}
          />
        )}
      </main>
    </div>
  )
}
