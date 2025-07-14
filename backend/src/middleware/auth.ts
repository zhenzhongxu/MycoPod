import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).end()
  const token = auth.split(' ')[1]
  try {
    ;(req as any).user = jwt.verify(token, 'secret') as any
    next()
  } catch {
    res.status(401).end()
  }
}
