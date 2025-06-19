import { useRuntimeConfig } from '#app'
import { computed } from 'vue'

export function useStrains() {
  const config = useRuntimeConfig()

  const { data: allStrains, pending, error, refresh } = useFetch(
    () => `${config.public.serverUrl}/strains/get-strains`,
    { key: 'all-strains' }
  )

  const brandOptions = computed(() => {
    const seen = new Set<string>()
    return (allStrains.value || [])
      .map(strain => strain.brand)
      .filter((brand): brand is string => {
        return typeof brand === 'string' && !seen.has(brand) && seen.add(brand)
      })
  })

  return { allStrains, brandOptions, pending, error, refresh }
}
