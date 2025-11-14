import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import PostCard from "@/components/posts/PostCard"

export default async function HashtagPage({
  params,
}: {
  params: { tag: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const tag = decodeURIComponent(params.tag)

  // Fetch posts with this hashtag
  const posts = await prisma.post.findMany({
    where: {
      hashtags: {
        has: tag,
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
  })

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user?.email! },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">#{tag}</h1>
          <p className="text-gray-500 mt-1">{posts.length} posts</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg mb-4">No posts with #{tag}</p>
            <p className="text-gray-400">Be the first to post with this hashtag!</p>
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
