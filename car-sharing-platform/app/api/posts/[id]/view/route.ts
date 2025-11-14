import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Increment view count
    await prisma.post.update({
      where: { id: params.id },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
    })

    return new NextResponse("View counted", { status: 200 })
  } catch (error) {
    console.error("View count error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
