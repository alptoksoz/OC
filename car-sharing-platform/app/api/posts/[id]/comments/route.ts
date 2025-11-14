import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId: params.id,
        parentId: null, // only get top-level comments
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
        replies: {
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
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Get comments error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(
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

    const body = await request.json()
    const { content, parentId } = body

    if (!content || content.trim() === "") {
      return new NextResponse("Content is required", { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        userId: user.id,
        postId: params.id,
        parentId: parentId || null,
        content: content.trim(),
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

    // Create notification for post owner (if not commenting on own post)
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (post && post.userId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: "comment",
          actorId: user.id,
          postId: params.id,
        },
      })
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Create comment error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
