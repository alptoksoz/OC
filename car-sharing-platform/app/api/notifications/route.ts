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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })

    // Get actor details and post details for each notification
    const notificationsWithDetails = await Promise.all(
      notifications.map(async (notification) => {
        const actor = await prisma.user.findUnique({
          where: { id: notification.actorId },
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        })

        let post = null
        if (notification.postId) {
          post = await prisma.post.findUnique({
            where: { id: notification.postId },
            select: {
              id: true,
              carBrand: true,
              carModel: true,
              images: true,
            },
          })
        }

        return {
          ...notification,
          actor,
          post,
        }
      })
    )

    return NextResponse.json(notificationsWithDetails)
  } catch (error) {
    console.error("Get notifications error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PUT() {
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

    // Mark all notifications as read
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    })

    return new NextResponse("Marked as read", { status: 200 })
  } catch (error) {
    console.error("Update notifications error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
