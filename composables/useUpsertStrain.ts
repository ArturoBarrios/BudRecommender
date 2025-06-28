// composables/useUpsertStrain.ts
import { useRuntimeConfig } from '#app'

export function useUpsertStrain() {
  const config = useRuntimeConfig()

  const upsertStrain = async (strain) => {
    console.log('🔄 Upserting strain:', strain)
    try {
      const body = {        
        strains: [strain],
      }

      const response = await $fetch(`${config.public.serverUrl}/strains/create-strains`, {
        method: 'POST',
        body,
      })

      console.log('✅ Upserted strain:', response)
      return { success: true, data: response }
    } catch (error) {
      console.error('❌ Failed to upsert strain:', error)
      return { success: false, error }
    }
  }

  return { upsertStrain }
}
