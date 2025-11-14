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

    const like = await prisma.like.create({
      data: {
        userId: user.id,
        postId: params.id,
      },
    })

    return NextResponse.json(like)
  } catch (error) {
    console.error("Like error:", error)
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

    await prisma.like.deleteMany({
      where: {
        userId: user.id,
        postId: params.id,
      },
    })

    return new NextResponse("Unliked", { status: 200 })
  } catch (error) {
    console.error("Unlike error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
