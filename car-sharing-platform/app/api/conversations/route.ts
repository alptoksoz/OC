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

    // Get all conversations for this user
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      },
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
            createdAt: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    })

    // Get unread message counts
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            receiverId: user.id,
            read: false,
          },
        })

        return {
          ...conv,
          unreadCount,
          otherUser: conv.user1Id === user.id ? conv.user2 : conv.user1,
        }
      })
    )

    return NextResponse.json(conversationsWithUnread)
  } catch (error) {
    console.error("Get conversations error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    const { otherUserId } = await request.json()

    if (!otherUserId) {
      return new NextResponse("Other user ID required", { status: 400 })
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: currentUser.id, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: currentUser.id },
        ],
      },
    })

    if (existingConversation) {
      return NextResponse.json(existingConversation)
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        user1Id: currentUser.id,
        user2Id: otherUserId,
      },
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
      },
    })

    return NextResponse.json(conversation)
  } catch (error) {
    console.error("Create conversation error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
