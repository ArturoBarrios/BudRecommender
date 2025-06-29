export const useStrainPreference = () => {
  const { session } = useSession()
  // console.log('Current session:', session.value)

  async function createOrUpdatePreference({
    strainId,
    liked,
    reason = '',
    effectsFelt = [],
    symptomRelief = [],
  }: {
    strainId: string
    liked: boolean
    reason?: string
    effectsFelt?: string[]
    symptomRelief?: string[]
  }) {
    const config = useRuntimeConfig()

    if (!session.value?.id) {
      console.warn('⚠️ No user session found')
      return null
    }

    try {
      const response = await $fetch(`${config.public.serverUrl}/strains/create-user-strain-preference`, {
        method: 'POST',
        body: {
          userId: session.value.id,
          strainId,
          liked,
          reason,
          effectsFelt,
          symptomRelief,
        },
        credentials: 'include',
      })

      return response
    } catch (err) {
      console.error('❌ Failed to create/update preference:', err)
      return null
    }
  }

  return {
    createOrUpdatePreference,
  }
}
