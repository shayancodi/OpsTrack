import { Router } from "express"
const router = Router()
router.get("/", (req, res) => {
    res.json({ status: "ok" })
})
import { prisma } from "../lib/prisma"

router.get("/db", async (_req, res) => {
  const userCount = await prisma.user.count()
  res.json({ status: "ok", userCount })
})
export default router