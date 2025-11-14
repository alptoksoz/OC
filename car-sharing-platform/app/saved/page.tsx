import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import PostCard from "@/components/posts/PostCard"
import EmptyState from "@/components/ui/EmptyState"
import { Bookmark } from "lucide-react"

export default async function SavedPostsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user?.email! },
  })

  if (!currentUser) {
    redirect("/login")
  }

  // Fetch saved posts
  const savedPosts = await prisma.savedPost.findMany({
    where: {
      userId: currentUser.id,
    },
    include: {
      post: {
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
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Saved Posts</h1>

        {savedPosts.length === 0 ? (
          <div className="bg-white rounded-lg">
            <EmptyState
              icon={Bookmark}
              title="No saved posts yet"
              description="Save posts to easily find them later. Tap the bookmark icon on any post to save it."
              actionLabel="Explore Posts"
              actionHref="/explore"
            />
          </div>
        ) : (
          <div className="space-y-6">
            {savedPosts.map((savedPost) => (
              <PostCard
                key={savedPost.post.id}
                post={savedPost.post as any}
                currentUserId={currentUser.id}
                initialIsSaved={true}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
