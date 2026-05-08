export function isMissingSupabaseAuthSession(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const maybeError = error as { name?: string; message?: string; status?: number }
  return (
    maybeError.name === 'AuthSessionMissingError' ||
    maybeError.message?.toLowerCase().includes('auth session missing') === true
  )
}
