export function getRoleFromToken(token: string): 'Admin' | 'User' {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role
  } catch {
    return 'User'
  }
}
