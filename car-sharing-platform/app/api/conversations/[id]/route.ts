import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get conversation with messages
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 })
    }

    // Check if user is part of this conversation
    if (conversation.user1Id !== user.id && conversation.user2Id !== user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: params.id,
        receiverId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    })

    return NextResponse.json({
      ...conversation,
      otherUser: conversation.user1Id === user.id ? conversation.user2 : conversation.user1,
    })
  } catch (error) {
    console.error("Get conversation error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
