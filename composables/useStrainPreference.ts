import { useSession } from '~/composables/useSession'

export const useStrainPreference = () => {
  const { session } = useSession()
  const config = useRuntimeConfig()

  /**
   * Set preference for a strain.
   * Pass liked: true | false to create/update preference.
   * Pass liked: null to remove preference.
   */
  async function setPreference({
    strainId,
    liked,
  }: {
    strainId: string
    liked: boolean | null
  }) {
    if (!session.value?.id) {
      console.warn('⚠️ No user session found')
      return null
    }

    try {
      return await $fetch(`${config.public.serverUrl}/strains/create-user-strain-preference`, {
        method: 'POST',
        body: {
          userId: session.value.id,
          strainId,
          liked,
        },
        credentials: 'include',
      })
    } catch (err) {
      console.error('❌ Failed to set preference:', err)
      return null
    }
  }

  return {
    setPreference,
  }
}
