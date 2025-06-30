<script setup>
definePageMeta({ middleware: ['authenticated'] })

import { useStrainStore } from '~/stores/strains'
import RecommendationModal from '~/components/RecommendationModal.vue'
import StrainCard from '~/components/StrainCard.vue'
import StrainSearchBar from '~/components/StrainSearchBar.vue'
import { ref, reactive, computed, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'


const strainStore = useStrainStore()
await strainStore.fetchStrains()

const { allStrains, storeOptions, pending, error } = storeToRefs(strainStore)

const selectedStore = ref('')
const showModal = ref(false)
const isLoadingRecommendation = ref(false)
const searchQuery = ref('')
const favorites = ref(new Set())

watchEffect(() => {
  if (!selectedStore.value && storeOptions.value.length) {
    selectedStore.value = storeOptions.value[0]
  }
})

// Helper to get recommendations for a given strain
function getRecommendationsForStrain(strainId) {
  const entry = strainStore.userStrainFavorites.find(e => e.strain.id === strainId)
  return entry ? entry.recommendations : []
}

function toggleFavorite(id) {
  if (favorites.value.has(id)) {
    favorites.value.delete(id)
  } else {
    favorites.value.add(id)
  }
}

const strains = computed(() => {
  let filtered = (allStrains.value || []).filter(strain => strain.store?.name === selectedStore.value)

  filtered = filtered.map(strain => ({
    ...strain,
    specialOffer: null,
  }))

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(strain => strain.name.toLowerCase().includes(q))
  }

  // Don't reorder strains here; sorting by recommendations should happen in the template or StrainCard level if needed

  return filtered
})

const form = reactive({
  brand: '',
  strainType: '',
  thcTier: '',
  priceTier: '',
  weight: '',
  mood: '',
  text: '',
})

async function submitRecommendation() {
  try {
    isLoadingRecommendation.value = true
    const response = await $fetch(`${useRuntimeConfig().public.serverUrl}/strains/recommend`, {
      method: 'POST',
      body: { ...form },
    })
    // Recommendation update handled elsewhere or on modal close
    showModal.value = false
  } catch (err) {
    console.error('Failed to fetch recommendation:', err)
  } finally {
    isLoadingRecommendation.value = false
  }
}
</script>

<template>  

  <RecommendationModal
    :show-modal="showModal"
    :is-loading="isLoadingRecommendation"
    :form="form"
    @open="showModal = true"
    @close="showModal = false"
    @recommend="submitRecommendation"
  />

  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-4">Admin: Strain List</h1>

    <div class="mb-4">
      <label class="mr-2 font-semibold">Store:</label>
      <select v-model="selectedStore" class="border rounded px-3 py-2">
        <option v-for="store in storeOptions" :key="store" :value="store">{{ store }}</option>
      </select>
    </div>

    <StrainSearchBar v-model="searchQuery" />

    <div v-if="pending" class="text-gray-500">Loading strains...</div>
    <div v-else-if="error" class="text-red-600">Failed to load strains.</div>

    <div v-else class="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
      <!-- Rendering StrainCard for each strain, passing recommendations per strain -->
      <StrainCard
        v-for="strain in strains"
        :key="strain.id"
        :strain="strain"
        :recommendations="getRecommendationsForStrain(strain.id)"
        :is-favorite="favorites.has(strain.id)"
        @toggle-favorite="toggleFavorite"
      />
    </div>
  </div>
</template>
