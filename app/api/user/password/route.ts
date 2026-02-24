import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Password change not available for this account" },
        { status: 400 }
      )
    }

    const credentialAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "credential",
          providerAccountId: user.id,
        },
      },
      select: {
        password: true,
      },
    })

    const currentHash = credentialAccount?.password || user.password

    if (!currentHash) {
      return NextResponse.json(
        { error: "Password change not available for this account" },
        { status: 400 }
      )
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, currentHash)
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    // Hash new password
    const saltRounds = Number.parseInt(process.env.BCRYPT_COST || "12")
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password and invalidate sessions via tokenVersion
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, tokenVersion: { increment: 1 } },
      })

      await tx.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: "credential",
            providerAccountId: user.id,
          },
        },
        create: {
          userId: user.id,
          type: "credentials",
          provider: "credential",
          providerAccountId: user.id,
          password: hashedPassword,
        },
        update: {
          type: "credentials",
          password: hashedPassword,
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    )
  }
}
