// useStrains.ts
//remove(onboarding still using this composable)
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
      .filter((brand): brand is string => typeof brand === 'string' && !seen.has(brand) && seen.add(brand))
  })

  const terpeneOptions = computed(() => {
    const seen = new Set<string>()
    return (allStrains.value || [])
      .flatMap(strain => strain.terpenes || [])
      .map(st => st.terpene?.name)
      .filter((name): name is string => typeof name === 'string' && !seen.has(name) && seen.add(name))
  })

  return { allStrains, brandOptions, terpeneOptions, pending, error, refresh }
}
