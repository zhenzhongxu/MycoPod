interface Props {
  plan: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmationModal({ plan, onConfirm, onCancel }: Props) {
  return (
    <div>
      <pre>{plan}</pre>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}

export default ConfirmationModal
