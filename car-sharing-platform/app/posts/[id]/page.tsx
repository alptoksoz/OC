import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import PostCard from "@/components/posts/PostCard"

export default async function PostPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
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
  })

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto py-8 px-4">
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg mb-4">Post not found</p>
          </div>
        </main>
      </div>
    )
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user?.email! },
  })

  // Check if current user has saved this post
  const savedPost = currentUser
    ? await prisma.savedPost.findUnique({
        where: {
          userId_postId: {
            userId: currentUser.id,
            postId: params.id,
          },
        },
      })
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto py-8 px-4">
        <PostCard
          post={post as any}
          currentUserId={currentUser?.id}
          initialIsSaved={!!savedPost}
        />
      </main>
    </div>
  )
}
