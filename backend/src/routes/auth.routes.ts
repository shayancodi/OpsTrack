import { Router } from "express"
import { registerUser } from "../services/auth.services"

const router = Router()

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "name, email, and password are required",
      })
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        error: "password must be at least 6 characters",
      })
    }

    const user = await registerUser({ name, email, password })

    return res.status(201).json({ user })
  } catch (err) {
    const error = err as Error & { statusCode?: number }

    if (error.statusCode === 409) {
      return res.status(409).json({ error: error.message })
    }

    console.error(error)
    return res.status(500).json({ error: "Registration failed" })
  }
})

export default router