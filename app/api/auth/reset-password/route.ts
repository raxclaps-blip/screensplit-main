import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashToken } from "@/lib/tokens"
import bcrypt from "bcrypt"
import { z } from "zod"

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters long").max(128, "Password is too long"),
})

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      const origin = request.headers.get("origin")
      const allowed = process.env.NEXT_PUBLIC_SITE_URL
      if (!origin || !allowed || origin !== allowed) {
        return NextResponse.json({ error: "Invalid origin" }, { status: 403 })
      }
    }
    const body = await request.json()

    // Validate input
    const validatedData = resetPasswordSchema.parse(body)

    // Atomic token consumption and password update
    const saltRounds = Number.parseInt(process.env.BCRYPT_COST || "12")
    const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds)

    const hashed = hashToken(validatedData.token)

    const result = await prisma.$transaction(async (tx) => {
      const tokenRow = await tx.passwordResetToken.findUnique({ where: { token: hashed } })
      if (!tokenRow || tokenRow.expires < new Date()) {
        if (tokenRow) {
          await tx.passwordResetToken.delete({ where: { token: tokenRow.token } })
        }
        return { ok: false }
      }
      await tx.passwordResetToken.delete({ where: { token: tokenRow.token } })
      const updatedUser = await tx.user.update({
        where: { email: tokenRow.email },
        data: {
          password: hashedPassword,
          tokenVersion: { increment: 1 },
        },
        select: {
          id: true,
        },
      })

      await tx.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: "credential",
            providerAccountId: updatedUser.id,
          },
        },
        create: {
          userId: updatedUser.id,
          type: "credentials",
          provider: "credential",
          providerAccountId: updatedUser.id,
          password: hashedPassword,
        },
        update: {
          userId: updatedUser.id,
          type: "credentials",
          password: hashedPassword,
        },
      })
      return { ok: true }
    })

    if (!result.ok) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
