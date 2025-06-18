<script setup>
import { ref, computed } from 'vue'
import { useSession } from '~/composables/useSession'
import StrainPreferenceModal from '~/components/StrainPreferenceModal.vue'

const props = defineProps({
  strain: Object,
})

const { session } = useSession()

const showModal = ref(false)

const isFavorite = computed(() => {
  if (!session.value?.preferences?.length) return false
  return session.value.preferences.some(
    (pref) => pref.strainId === props.strain.id && pref.liked === true
  )
})

const isDisliked = computed(() => {
  if (!session.value?.preferences?.length) return false
  return session.value.preferences.some(
    (pref) => pref.strainId === props.strain.id && pref.liked === false
  )
})

function handlePreferenceUpdate(updatedPreference) {
  const index = session.value.preferences.findIndex((p) => p.strainId === props.strain.id)

  if (index !== -1) {
    session.value.preferences[index] = updatedPreference
  } else {
    session.value.preferences.push(updatedPreference)
  }
}

</script>

<template>
  <div class="border rounded-xl p-4 shadow-sm hover:shadow-md transition relative">
    <button @click="showModal = true" class="absolute top-3 right-3 text-2xl">
  <span v-if="isFavorite">💚</span>
  <span v-else-if="isDisliked">🖤</span>
  <span v-else>🤍</span>
</button>


    <h2 class="text-xl font-semibold">{{ strain.name }}</h2>
    <h3 v-if="strain.brand?.name" class="text-sm text-gray-500 italic">{{ strain.brand.name }}</h3>

    <div
      v-if="strain.specialOffer"
      class="bg-yellow-300 text-yellow-900 px-2 py-1 text-xs font-semibold rounded"
    >
      🎉 {{ strain.specialOffer }}
    </div>

    <p class="text-sm text-gray-600 italic">{{ strain.strainType }}</p>
    <p class="text-sm text-gray-700 mt-1">THC: {{ strain.thc }}%</p>
    <p class="text-sm text-gray-700">Price: {{ strain.price }}</p>
    <p class="text-sm text-gray-700">Weight: {{ strain.weight }}</p>

    <div v-if="strain.terpenes?.length" class="mt-2 text-xs text-gray-600">
      <p class="font-medium">Terpenes:</p>
      <ul class="list-disc list-inside">
        <li v-for="terpene in strain.terpenes" :key="terpene.id">
          {{ terpene.name }} - {{ terpene.percentage }}%
        </li>
      </ul>
    </div>

    <StrainPreferenceModal
      :strain="strain"
      :show="showModal"
      @close="showModal = false"
      @preference-updated="handlePreferenceUpdate"
    />
  </div>
</template>
