import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET user settings
export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true,
            password: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const providerSet = new Set<string>()
    if (user.accounts.some((account) => account.provider === "credential" && Boolean(account.password))) {
      providerSet.add("credentials")
    }
    for (const account of user.accounts) {
      if (account.provider && account.provider !== "credential") {
        providerSet.add(account.provider)
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
      },
      authProviders: Array.from(providerSet),
    })
  } catch (error) {
    console.error("Error fetching user settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch user settings" },
      { status: 500 }
    )
  }
}

// PATCH update user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email } = body
    const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : ""

    const userAuth = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    })

    if (!userAuth) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isOAuthManagedProfile = userAuth.accounts.some(
      (account) => account.provider === "google" || account.provider === "github"
    )

    if (isOAuthManagedProfile) {
      return NextResponse.json(
        { error: "Profile details are managed by your OAuth provider and cannot be edited here." },
        { status: 403 }
      )
    }

    // Check if email is already taken by another user
    if (normalizedEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      })

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: typeof name === "string" ? name.trim() : undefined,
        email: normalizedEmail || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error updating user settings:", error)
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    )
  }
}

// DELETE user account
export async function DELETE() {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete user and all related data (cascade)
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user account:", error)
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    )
  }
}
