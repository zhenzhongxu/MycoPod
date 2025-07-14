export async function parseIntent(content: string): Promise<string> {
  return `Parsed plan for: ${content}`
}

export async function reconcile(intent: string): Promise<void> {
  console.log('Reconciling', intent)
}
