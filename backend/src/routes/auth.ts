import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

router.post('/login', (req, res) => {
  const { username } = req.body
  const token = jwt.sign({ role: 'Admin', username }, 'secret', { expiresIn: '1h' })
  res.json({ token })
})

export default router
