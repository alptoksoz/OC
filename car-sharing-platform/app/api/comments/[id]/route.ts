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

    // Check if comment exists and belongs to user
    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
    })

    if (!comment) {
      return new NextResponse("Comment not found", { status: 404 })
    }

    if (comment.userId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: params.id },
    })

    return new NextResponse("Comment deleted", { status: 200 })
  } catch (error) {
    console.error("Delete comment error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
