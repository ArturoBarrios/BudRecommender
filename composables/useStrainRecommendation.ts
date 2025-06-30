// composables/useStrainRecommendation.ts
import { useRuntimeConfig } from '#app'

export function useStrainRecommendation() { 
  async function fetchStrainRecommendation(body: Record<string, any>) {
    try {
      const config = useRuntimeConfig()
      const response = await $fetch(`${config.public.serverUrl}/strains/recommend`, {
        method: 'POST',
        body,
      })
      const parsed = JSON.parse(response.recommendations)
      return parsed
    } catch (err) {
      console.error('Failed to fetch recommendation:', err)
      return null
    }
  }

  return { fetchStrainRecommendation }
}
