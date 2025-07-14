import { Router } from 'express'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.post('/', requireAuth, (req, res) => {
  // placeholder: insert into db
  res.json({ ok: true })
})

router.get('/', requireAuth, (_req, res) => {
  res.json([])
})

export default router
