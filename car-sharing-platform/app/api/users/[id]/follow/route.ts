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

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Can't follow yourself
    if (currentUser.id === params.id) {
      return new NextResponse("Cannot follow yourself", { status: 400 })
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: params.id,
        },
      },
    })

    if (existingFollow) {
      return new NextResponse("Already following", { status: 400 })
    }

    const follow = await prisma.follow.create({
      data: {
        followerId: currentUser.id,
        followingId: params.id,
      },
    })

    return NextResponse.json(follow)
  } catch (error) {
    console.error("Follow error:", error)
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

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    await prisma.follow.deleteMany({
      where: {
        followerId: currentUser.id,
        followingId: params.id,
      },
    })

    return new NextResponse("Unfollowed", { status: 200 })
  } catch (error) {
    console.error("Unfollow error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
