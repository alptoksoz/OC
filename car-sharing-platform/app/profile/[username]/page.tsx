import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import ProfileHeader from "@/components/profile/ProfileHeader"
import PostCard from "@/components/posts/PostCard"
import UserStats from "@/components/profile/UserStats"
import EmptyState from "@/components/ui/EmptyState"
import { Image } from "lucide-react"

export default async function ProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Find user by username or email
  const profileUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: params.username },
        { email: params.username },
      ],
    },
    include: {
      posts: {
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
      },
      followers: true,
      following: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  })

  if (!profileUser) {
    notFound()
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user?.email! },
    include: {
      following: true,
    },
  })

  const isFollowing = currentUser?.following.some(
    (follow) => follow.followingId === profileUser.id
  )

  const isOwnProfile = currentUser?.id === profileUser.id

  // Calculate user statistics
  const totalLikes = profileUser.posts.reduce(
    (sum, post) => sum + (post._count?.likes || 0),
    0
  )
  const totalComments = profileUser.posts.reduce(
    (sum, post) => sum + (post._count?.comments || 0),
    0
  )
  const totalViews = profileUser.posts.reduce(
    (sum, post) => sum + (post.viewsCount || 0),
    0
  )

  // Calculate top hashtags
  const hashtagCounts = new Map<string, number>()
  profileUser.posts.forEach((post) => {
    post.hashtags.forEach((tag) => {
      hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1)
    })
  })

  const topHashtags = Array.from(hashtagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto py-8 px-4">
        <ProfileHeader
          user={profileUser}
          isOwnProfile={isOwnProfile || false}
          isFollowing={isFollowing || false}
          postsCount={profileUser._count.posts}
          followersCount={profileUser._count.followers}
          followingCount={profileUser._count.following}
        />

        {/* User Statistics */}
        {profileUser.posts.length > 0 && (
          <div className="mt-6">
            <UserStats
              totalLikes={totalLikes}
              totalComments={totalComments}
              totalViews={totalViews}
              topHashtags={topHashtags}
            />
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Posts</h2>
          {profileUser.posts.length === 0 ? (
            <div className="bg-white rounded-lg">
              <EmptyState
                icon={Image}
                title={isOwnProfile ? "You haven't posted yet" : "No posts yet"}
                description={
                  isOwnProfile
                    ? "Share your first car to get started!"
                    : "This user hasn't shared any posts yet"
                }
                actionLabel={isOwnProfile ? "Create Post" : undefined}
                actionHref={isOwnProfile ? "/create" : undefined}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileUser.posts.map((post) => (
                <PostCard key={post.id} post={post as any} currentUserId={currentUser?.id} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
