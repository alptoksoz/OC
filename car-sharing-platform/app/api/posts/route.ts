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

    const body = await request.json()
    const { carBrand, carModel, carYear, description, images, hashtags } = body

    if (!carBrand || !carModel || !carYear) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        carBrand,
        carModel,
        carYear: parseInt(carYear),
        description: description || "",
        images: images || [],
        hashtags: hashtags || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Create post error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
