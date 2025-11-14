import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    const { conversationId, receiverId, content } = await request.json()

    if (!conversationId || !receiverId || !content || content.trim() === "") {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Verify conversation exists and user is part of it
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 })
    }

    if (conversation.user1Id !== user.id && conversation.user2Id !== user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        receiverId,
        content: content.trim(),
      },
    })

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Send message error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
