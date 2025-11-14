import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/layout/Navbar"
import ProfileHeader from "@/components/profile/ProfileHeader"
import PostCard from "@/components/posts/PostCard"

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

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Posts</h2>
          {profileUser.posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No posts yet</p>
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
