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