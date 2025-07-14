import { useEffect, useState } from 'react'
import api from '../services/api'

interface Log {
  id: number
  message: string
}

function AuditTrail() {
  const [logs, setLogs] = useState<Log[]>([])

  useEffect(() => {
    api.get('/audit').then(res => setLogs(res.data))
  }, [])

  return (
    <ul>
      {logs.map(l => (
        <li key={l.id}>{l.message}</li>
      ))}
    </ul>
  )
}

export default AuditTrail
