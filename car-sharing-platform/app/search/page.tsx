import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import PostCard from "@/components/posts/PostCard"

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

  if (query.trim()) {
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
            <p className="text-gray-500">Enter a search term to find posts</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg mb-2">No results found</p>
            <p className="text-gray-400">Try searching for different brands, models, or hashtags</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-gray-600 mb-4">{posts.length} result{posts.length !== 1 ? "s" : ""} found</p>
            {posts.map((post) => (
              <PostCard key={post.id} post={post as any} currentUserId={currentUser?.id} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
