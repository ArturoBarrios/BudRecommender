import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'
import { computed, ref } from 'vue'

export const useStrainStore = defineStore('strains', () => {
  const config = useRuntimeConfig()
  const allStrains = ref([])
  const pending = ref(false)
  const error = ref(null)

  const brandOptions = computed(() => {
  const map = new Map<string, { id: string; name: string; rank: number | null; userRank: number | null }>()
  for (const strain of allStrains.value) {
    const b = strain.brand
    if (b?.id && b.name) {
      if (!map.has(b.id)) {
        map.set(b.id, { 
          id: b.id, 
          name: b.name, 
          rank: b.rank ?? null, 
          userRank: b.userRank ?? null // new property here
        })
      }
    }
  }
  return Array.from(map.values())
})


  

  const terpeneOptions = computed(() => {
    const seen = new Set<string>()
    return allStrains.value
      .flatMap(strain => strain.terpenes || [])
      .map(st => st.terpene?.name || st.name)
      .filter((name): name is string => !!name && !seen.has(name) && seen.add(name))
  })

  const storeOptions = computed(() => {
    const seen = new Set<string>()
    return allStrains.value
      .map(strain => strain.store?.name)
      .filter((storeName): storeName is string =>
        !!storeName && !seen.has(storeName) && seen.add(storeName)
      )
  })

  const fetchStrains = async () => {
    if (allStrains.value.length) return
    try {
      pending.value = true
      const result = await $fetch(`${config.public.serverUrl}/strains/get-strains`)
      allStrains.value = result
      console.log("Fetched allStrains:", allStrains.value)
    } catch (err) {
      error.value = err
    } finally {
      pending.value = false
    }
  }

  return {
    allStrains,
    pending,
    error,
    fetchStrains,
    brandOptions,
    storeOptions,
    terpeneOptions,
  }
})
