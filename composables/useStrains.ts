import { useRuntimeConfig } from '#app'

export function useStrains() {
  const config = useRuntimeConfig()

  const { data: allStrains, pending, error, refresh } = useFetch(
    () => `${config.public.serverUrl}/strains/get-strains`,
    { key: 'all-strains' }
  )

  return { allStrains, pending, error, refresh }
}
