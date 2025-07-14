import { useState } from 'react'

interface Props {
  onSubmit: (text: string) => void
}

function DeclarationInput({ onSubmit }: Props) {
  const [text, setText] = useState('')

  const handle = () => {
    onSubmit(text)
  }

  return (
    <div>
      <textarea value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handle}>Submit</button>
    </div>
  )
}

export default DeclarationInput
