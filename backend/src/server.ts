import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import auth from './routes/auth'
import declarations from './routes/declarations'
import audit from './routes/audit'

dotenv.config()

const app = express()
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use('/api/v1/auth', auth)
app.use('/api/v1/declarations', declarations)
app.use('/api/v1/audit', audit)

app.get('/api/v1/ping', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(4000, () => {
  console.log('server started on 4000')
})
