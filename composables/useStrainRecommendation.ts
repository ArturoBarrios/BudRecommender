// composables/useStrainRecommendation.ts
import { useRuntimeConfig } from '#app'

export function useStrainRecommendation() {
  async function fetchStrainRecommendation(body: Record<string, any>) {
    try {
      const config = useRuntimeConfig()
      const response = await $fetch(`${config.public.serverUrl}/strains/recommend/v2`, {
        method: 'POST',
        body,
      })

      if (!response?.success || !Array.isArray(response.recommendations)) {
        console.error('Invalid recommendations response format:', response)
        return []
      }

      console.log('📦 Recommendation response:', response.recommendations)
      return response.recommendations
    } catch (err) {
      console.error('❌ Failed to fetch recommendation:', err)
      return []
    }
  }

  return { fetchStrainRecommendation }
}
