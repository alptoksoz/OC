import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // Check if post exists and belongs to user
    const post = await prisma.post.findUnique({
      where: { id: params.id },
    })

    if (!post) {
      return new NextResponse("Post not found", { status: 404 })
    }

    if (post.userId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Delete the post (cascade will delete likes, comments, and saved posts)
    await prisma.post.delete({
      where: { id: params.id },
    })

    return new NextResponse("Post deleted", { status: 200 })
  } catch (error) {
    console.error("Delete post error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
