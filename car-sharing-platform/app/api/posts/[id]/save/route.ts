import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    const savedPost = await prisma.savedPost.create({
      data: {
        userId: user.id,
        postId: params.id,
      },
    })

    return NextResponse.json(savedPost)
  } catch (error) {
    console.error("Save post error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
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

    await prisma.savedPost.deleteMany({
      where: {
        userId: user.id,
        postId: params.id,
      },
    })

    return new NextResponse("Unsaved", { status: 200 })
  } catch (error) {
    console.error("Unsave post error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
