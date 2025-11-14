import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        following: true,
      },
    })

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Get stories from followed users + own stories
    const followingIds = currentUser.following.map((f) => f.followingId)
    const userIds = [currentUser.id, ...followingIds]

    const stories = await prisma.story.findMany({
      where: {
        userId: {
          in: userIds,
        },
        expiresAt: {
          gte: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Group stories by user
    const storyGroups = stories.reduce((acc: any, story) => {
      const userId = story.userId
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: [],
        }
      }
      acc[userId].stories.push(story)
      return acc
    }, {})

    return NextResponse.json(Object.values(storyGroups))
  } catch (error) {
    console.error("Get stories error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return new NextResponse("Image URL required", { status: 400 })
    }

    // Stories expire after 24 hours
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const story = await prisma.story.create({
      data: {
        userId: user.id,
        imageUrl,
        expiresAt,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(story)
  } catch (error) {
    console.error("Create story error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
