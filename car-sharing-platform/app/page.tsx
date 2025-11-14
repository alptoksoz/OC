import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import PostCard from "@/components/posts/PostCard"
import PostFilters from "@/components/filters/PostFilters"
import StoryCircles from "@/components/stories/StoryCircles"

export default async function Home({
  searchParams,
}: {
  searchParams: { brand?: string; model?: string; yearFrom?: string; yearTo?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Build filter conditions
  const where: any = {}

  if (searchParams.brand) {
    where.carBrand = {
      contains: searchParams.brand,
      mode: "insensitive",
    }
  }

  if (searchParams.model) {
    where.carModel = {
      contains: searchParams.model,
      mode: "insensitive",
    }
  }

  if (searchParams.yearFrom || searchParams.yearTo) {
    where.carYear = {}
    if (searchParams.yearFrom) {
      where.carYear.gte = parseInt(searchParams.yearFrom)
    }
    if (searchParams.yearTo) {
      where.carYear.lte = parseInt(searchParams.yearTo)
    }
  }

  // Fetch posts with user, likes, and comments
  const posts = await prisma.post.findMany({
    where,
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
        orderBy: {
          createdAt: "desc",
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
    take: 50,
  })

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user?.email! },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto py-8 px-4">
        <StoryCircles currentUserId={currentUser?.id} />

        <PostFilters />

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg mb-4">No posts found</p>
            <p className="text-gray-400">Try adjusting your filters or be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post as any} currentUserId={currentUser?.id} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
