<script setup>
definePageMeta({
  middleware: ['authenticated']
})

import { useStrainStore } from '~/stores/strains'
const strainStore = useStrainStore()
await strainStore.fetchStrains()

const {
  allStrains,
  brandOptions,
  storeOptions,
  pending,
  error,
} = storeToRefs(strainStore)

import RecommendationModal from '../components/RecommendationModal.vue'
import StrainCard from '../components/StrainCard.vue'
import StrainSearchBar from '../components/StrainSearchBar.vue'

const selectedStore = ref('')
const showModal = ref(false)
const isLoadingRecommendation = ref(false)
const searchQuery = ref('')
const recommendations = ref([])
const favorites = ref(new Set())

watchEffect(() => {
  if (!selectedStore.value && storeOptions.value.length) {
    selectedStore.value = storeOptions.value[0]
  }
})

function toggleFavorite(id) {
  if (favorites.value.has(id)) {
    favorites.value.delete(id)
  } else {
    favorites.value.add(id)
  }
}

const strains = computed(() => {
  let filtered = (allStrains.value || [])
    .filter(strain => strain.store?.name === selectedStore.value)

  filtered = filtered.map(strain => ({
    ...strain,
    specialOffer: null // Placeholder; update if you reintroduce offers
  }))

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(strain => strain.name.toLowerCase().includes(q))
  }

  if (recommendations.value.length > 0) {
    const recNames = recommendations.value.map(r => r.name)
    return [
      ...filtered.filter(s => recNames.includes(s.name)),
      ...filtered.filter(s => !recNames.includes(s.name)),
    ]
  }

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
  console.log('📤 Submitting recommendation form:', form)
  try {
    isLoadingRecommendation.value = true
    const response = await $fetch(`${useRuntimeConfig().public.serverUrl}/strains/recommend`, {
      method: 'POST',
      body: { ...form },
    })

    const parsed = JSON.parse(response.recommendations)
    recommendations.value = parsed
    console.log('📦 AI Recommendation Results:', parsed)
    showModal.value = false
  } catch (err) {
    console.error('❌ Failed to fetch recommendation:', err)
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

    <!-- Store filter -->
    <div class="mb-4">
      <label class="mr-2 font-semibold">Store:</label>
      <select v-model="selectedStore" class="border rounded px-3 py-2">
        <option v-for="store in storeOptions" :key="store">{{ store }}</option>
      </select>
    </div>

    <StrainSearchBar v-model="searchQuery" />

    <div v-if="pending" class="text-gray-500">Loading strains...</div>
    <div v-else-if="error" class="text-red-600">Failed to load strains.</div>

    <div v-else class="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
      <template v-if="recommendations.length">
        <div class="col-span-full mb-2">
          <h2 class="text-xl font-semibold text-green-700">Recommendation</h2>
          <ul class="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li v-if="form.strainType">Strain Type: <strong>{{ form.strainType }}</strong></li>
            <li v-if="form.thcTier">
              THC: <strong>
                {{
                  form.thcTier === 'low' ? '< 20%' :
                  form.thcTier === 'mid' ? '20–25%' : '> 25%'
                }}
              </strong>
            </li>
            <li v-if="form.priceTier">
              Price: <strong>
                {{
                  form.priceTier === 'low' ? '< $30' :
                  form.priceTier === 'mid' ? '$30–$60' : '> $60'
                }}
              </strong>
            </li>
            <li v-if="form.weight">Weight: <strong>{{ form.weight }}</strong></li>
            <li v-if="form.mood">Mood: <strong>{{ form.mood }}</strong></li>
            <li v-if="form.text">Note: <em>"{{ form.text }}"</em></li>
          </ul>
        </div>

        <div
          v-for="rec in recommendations"
          :key="'rec-' + rec.name"
          class="border-2 border-green-500 rounded-2xl shadow-sm p-5 bg-white hover:shadow-md transition relative"
        >
          <button
            @click="toggleFavorite(strains.find(s => s.name === rec.name)?.id)"
            class="absolute top-3 right-3 text-2xl"
          >
            <span v-if="favorites.has(strains.find(s => s.name === rec.name)?.id)">💚</span>
            <span v-else>🤍</span>
          </button>

          <div class="mb-2">
            <h2 class="text-lg font-bold">{{ rec.name }}</h2>
            <p class="text-sm text-green-600 italic">🌿 {{ rec.reason }}</p>
          </div>

          <div
            v-for="strain in strains.filter(s => s.name === rec.name)"
            :key="strain.id"
            class="text-sm text-gray-700 space-y-1 mb-3"
          >
            <p><span class="font-medium">THC:</span> {{ strain.thc }}%</p>
            <p><span class="font-medium">Price:</span> {{ strain.price }}</p>
            <p><span class="font-medium">Weight:</span> {{ strain.weight }}</p>
          </div>
        </div>
      </template>

      <StrainCard
        v-for="strain in strains.filter(s => !recommendations.map(r => r.name).includes(s.name))"
        :key="strain.id"
        :strain="strain"
        :is-favorite="favorites.has(strain.id)"
        @toggle-favorite="toggleFavorite"
      />
    </div>
  </div>
</template>
