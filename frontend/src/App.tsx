import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DeclarationPage from './pages/Declaration'
import AuditPage from './pages/Audit'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/declarations" element={<DeclarationPage />} />
        <Route path="/audit" element={<AuditPage />} />
      </Routes>
    </Router>
  )
}

export default App
