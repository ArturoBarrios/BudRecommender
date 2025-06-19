import { useRouter, useRuntimeConfig } from '#app'
import { useSession } from './useSession'

export function useLogout() {
  const { session, fetchSession } = useSession()
  const router = useRouter()
  const config = useRuntimeConfig()

  async function logout(): Promise<void> {
    try {
      await $fetch(`${config.public.serverUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      await fetchSession()
      router.push('/login')
    } catch (err) {
      console.error('❌ Logout error:', err)
    }
  }

  return { logout, session }
}
