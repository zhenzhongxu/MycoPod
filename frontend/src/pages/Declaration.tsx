import { useState } from 'react'
import DeclarationInput from '../components/DeclarationInput'
import ConfirmationModal from '../components/ConfirmationModal'
import { getRoleFromToken } from '../utils/auth'

function DeclarationPage() {
  const [plan, setPlan] = useState('')
  const [show, setShow] = useState(false)

  const handleSubmit = (text: string) => {
    setPlan('Plan for: ' + text)
    setShow(true)
  }

  const role = getRoleFromToken('')

  return (
    <div>
      <h2>New Declaration</h2>
      <DeclarationInput onSubmit={handleSubmit} />
      {show && (
        <ConfirmationModal
          plan={plan}
          onConfirm={() => alert('Confirmed')}
          onCancel={() => setShow(false)}
        />
      )}
      {role === 'Admin' && <button>Commit</button>}
    </div>
  )
}

export default DeclarationPage
