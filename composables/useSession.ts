// ~/composables/useSession.ts
export const useSession = () => {
  const session = useState('session', () => null)

  async function fetchSession() {
    try {
      const config = useRuntimeConfig()
      const res = await $fetch(`${config.public.serverUrl}/auth/me`, {
        credentials: 'include',
      })
      session.value = res.user
    } catch {
      session.value = null
    }
  }

  async function logout() {
    const config = useRuntimeConfig()
    await $fetch(`${config.public.serverUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    session.value = null
  }

  return { session, fetchSession, logout }
}
