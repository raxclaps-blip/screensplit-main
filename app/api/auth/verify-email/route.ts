import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyEmailToken } from "@/lib/tokens"
import { sendWelcomeEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      )
    }

    // Verify the token
    const email = await verifyEmailToken(token)

    if (!email) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      )
    }

    // Update user email verification status
    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    })

    try {
      await sendWelcomeEmail(user.email!, user.name || "there")
    } catch (error) {
      console.error("Error sending welcome email:", error)
    }

    return NextResponse.json(
      {
        message: "Email verified successfully",
        user,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    )
  }
}
