export default defineNuxtRouteMiddleware(async () => {
  if (process.server) return

  const config = useRuntimeConfig()
  try {
    const { data } = await useFetch(`${config.public.serverUrl}/auth/me`, {
      credentials: 'include',
    })

    if (!data.value?.user) {
      return navigateTo('/login')
    }
  } catch {
    return navigateTo('/login')
  }
})
