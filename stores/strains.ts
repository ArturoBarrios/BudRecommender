import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'
import { computed, ref } from 'vue'

export const useStrainStore = defineStore('strains', () => {
  const config = useRuntimeConfig()
  const allStrains = ref([])
  const pending = ref(false)
  const error = ref(null)

  const brandOptions = computed(() => {
    const seen = new Set<string>()
    return allStrains.value
      .map(strain => strain.brand?.name)
      .filter((brandName): brandName is string =>
        !!brandName && !seen.has(brandName) && seen.add(brandName)
      )
  })

  const storeOptions = computed(() => {
    const seen = new Set<string>()
    return allStrains.value
      .flatMap(strain => strain.stores.map(store => store.name))
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
      console.log("Computed brandOptions:", brandOptions.value)
      console.log("Computed storeOptions:", storeOptions.value)
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
  }
})
