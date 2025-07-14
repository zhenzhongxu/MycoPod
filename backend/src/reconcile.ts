import { parseIntent, reconcile } from './services/llm'

async function run() {
  const plan = await parseIntent('example')
  await reconcile(plan)
}

run().catch(console.error)
