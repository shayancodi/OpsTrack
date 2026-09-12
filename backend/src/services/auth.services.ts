import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"

type RegisterInput = {
  name: string
  email: string
  password: string
}

export async function registerUser(input: RegisterInput) {
  const { name, email, password } = input

  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    const error = new Error("Email already registered")
    // custom flag so the route can send 409
    ;(error as Error & { statusCode?: number }).statusCode = 409
    throw error
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  return user
}
import jwt from "jsonwebtoken"

type LoginInput = {
  email: string
  password: string
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not set")
  }
  return secret
}

export async function loginUser(input: LoginInput) {
  const { email, password } = input

  const user = await prisma.user.findUnique({
    where: { email },
  })

  // Same message whether email missing or password wrong (security)
  if (!user) {
    const error = new Error("Invalid email or password")
    ;(error as Error & { statusCode?: number }).statusCode = 401
    throw error
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    const error = new Error("Invalid email or password")
    ;(error as Error & { statusCode?: number }).statusCode = 401
    throw error
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    getJwtSecret(),
    { expiresIn: "7d" }
  )

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  }
}