<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useSession } from '~/composables/useSession'
import { useStrainPreference } from '~/composables/useStrainPreference'
import { useStrainStore } from '~/stores/strains'
import StrainPreferenceModal from '~/components/StrainPreferenceModal.vue'
import { useUpsertStrain } from '~/composables/useUpsertStrain.ts'

const { session } = useSession()
const { setPreference } = useStrainPreference()
const { upsertStrain } = useUpsertStrain()
const strainStore = useStrainStore()

const props = defineProps({
  strain: Object,
  recommendations: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['preference-updated'])

const showModal = ref(false)
const showPreferencePopup = ref(false)
const isEditing = ref(false)
const editableTerpenes = ref([])

const isFavorite = computed(() => {
  return session.value?.preferences?.some(p => p.strainId === props.strain.id && p.liked === true)
})

const isDisliked = computed(() => {
  return session.value?.preferences?.some(p => p.strainId === props.strain.id && p.liked === false)
})

watchEffect(() => {
  if (isEditing.value) {
    const strainTerpenes = props.strain.terpenes?.map(t => ({ ...t })) || []
    const allOptions = strainStore.terpeneOptions.map(name => ({ name, percentage: 0, id: name }))
    editableTerpenes.value = allOptions
  .map(opt => {
    const match = strainTerpenes.find(t => t.name === opt.name)
    return match ? { ...match } : opt
  })
  .sort((a, b) => {
    if (a.rank != null && b.rank != null) return a.rank - b.rank
    if (a.rank != null) return -1
    if (b.rank != null) return 1
    return a.name.localeCompare(b.name)
  })
  }
})

const enrichedRecommendations = computed(() => {
  if (!props.recommendations.length) return []
  const allStrains = strainStore.allStrains || []
  return props.recommendations.map(rec => {
    const fullStrain = allStrains.find(s => s.id === rec.id || s.name === rec.name)
    return fullStrain || rec
  })
})

async function updatePreference(value) {
  if (!session.value?.id) return
  const liked = value === null ? null : value === 'like'
  const result = await setPreference({ strainId: props.strain.id, liked })
  if (!result?.success) return console.error('Failed to set preference')

  const idx = session.value.preferences.findIndex(p => p.strainId === props.strain.id)
  if (liked === null) {
    if (idx !== -1) session.value.preferences.splice(idx, 1)
  } else {
    if (idx !== -1) session.value.preferences[idx].liked = liked
    else session.value.preferences.push({ strainId: props.strain.id, liked })
  }

  showPreferencePopup.value = false
  emit('preference-updated')
}

function onClickOutside(event) {
  if (!event.target.closest('.preference-popup') && !event.target.closest('.heart-button')) {
    showPreferencePopup.value = false
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', onClickOutside)
}

async function handleStrainUpdate(updatedStrain, storeName) {
  const result = await upsertStrain(updatedStrain, storeName)
  if (!result.success) return console.error('❌ Could not save strain:', result.error)
  console.log('🎉 Strain saved!')
}

function handlePreferenceUpdate(updatedPreference) {
  const idx = session.value.preferences.findIndex(p => p.strainId === props.strain.id)
  if (idx !== -1) session.value.preferences[idx] = updatedPreference
  else session.value.preferences.push(updatedPreference)
}
</script>

<template>
  <div class="border rounded-xl p-4 shadow-sm hover:shadow-md transition relative">
    <button @click.stop="showPreferencePopup = !showPreferencePopup"
      class="heart-button absolute top-3 right-3 text-2xl cursor-pointer select-none" aria-label="Toggle preference">
      <span v-if="isFavorite">💚</span>
      <span v-else-if="isDisliked">🖤</span>
      <span v-else>🤍</span>
    </button>

    <div v-if="showPreferencePopup"
      class="preference-popup absolute top-10 right-3 z-30 bg-white border border-gray-300 rounded shadow-md px-3 py-2 flex gap-2">
      <button @click="updatePreference('like')" type="button"
        class="text-sm font-bold px-3 py-1 rounded transition"
        :class="isFavorite ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'">
        💚
      </button>
      <button @click="updatePreference('dislike')" type="button"
        class="text-sm font-bold px-3 py-1 rounded transition"
        :class="isDisliked ? 'bg-black text-white' : 'bg-gray-100 text-black hover:bg-gray-300'">
        🖤
      </button>
      <button @click="updatePreference(null)" type="button"
        class="text-sm font-bold px-3 py-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition">
        ❌
      </button>
    </div>

    <div class="flex items-start">
      <div v-if="strain.imageUrl" class="relative w-1/2 ml-auto mr-0">
        <img :src="strain.imageUrl" alt="Strain Image" class="rounded-lg object-contain w-full max-h-48" />
      </div>

      <div class="w-1/2">
        <h2 class="text-xl font-semibold">{{ strain.name }}</h2>
        <h3 v-if="strain.brand?.name" class="text-sm text-gray-500 italic">{{ strain.brand.name }}</h3>
        <div v-if="strain.specialOffer" class="bg-yellow-300 text-yellow-900 px-2 py-1 text-xs font-semibold rounded">
          🎉 {{ strain.specialOffer }}
        </div>
        <p class="text-sm text-gray-600 italic">{{ strain.strainType }}</p>
        <p class="text-sm text-gray-700 mt-1">THC: {{ strain.thc }}%</p>
        <p class="text-sm text-gray-700">Price: {{ strain.price }}</p>
        <p class="text-sm text-gray-700">Weight: {{ strain.weight }}</p>

        <div class="mt-2 text-xs text-gray-600">
          <p class="font-medium">Terpenes:</p>
          <template v-if="!isEditing">
            <ul v-if="strain.terpenes?.length" class="list-disc list-inside">
              <li
                v-for="terpene in strain.terpenes
                  .filter(t => t.percentage > 0)
                  .sort((a, b) => {
                    if (a.rank != null && b.rank != null) return a.rank - b.rank
                    if (a.rank != null) return -1
                    if (b.rank != null) return 1
                    return a.name.localeCompare(b.name)
                  })"                  
                :key="terpene.id"
              >              
                {{ terpene.name }} - {{ terpene.percentage }}%
              </li>
            </ul>
            <button
              class="mt-1 text-blue-600 underline text-xs hover:text-blue-800"
              @click="isEditing = true"
            >
              ✏️ Edit Terpenes
            </button>
          </template>

          <template v-else>
            <div v-for="terpene in editableTerpenes" :key="terpene.id" class="flex items-center space-x-2 mt-1">
              <span class="w-28 truncate">{{ terpene.name }}</span>
              <input type="number" v-model="terpene.percentage"
                class="border px-1 py-0.5 text-xs w-20 rounded" min="0" max="100" step="0.1" />
              <span class="text-xs text-gray-500">%</span>
            </div>
            <div class="mt-2 space-x-2">
              <button @click="handleStrainUpdate({ ...strain, terpenes: editableTerpenes }, strain.store?.name)"
                class="bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700">
                Save
              </button>
              <button @click="isEditing = false" class="text-xs text-gray-500 underline">
                Cancel
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <StrainPreferenceModal :strain="strain" :show="showModal" @close="showModal = false"
      @preference-updated="handlePreferenceUpdate" />

    <div v-if="isFavorite && enrichedRecommendations.length" class="mt-4">
      <h3 class="text-sm font-semibold mb-2 text-gray-700">Similar Strains</h3>
      <div class="flex space-x-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
        style="scroll-snap-type: x mandatory;">
        <div v-for="rec in enrichedRecommendations" :key="rec.id"
          class="min-w-[180px] bg-white border rounded-xl shadow hover:shadow-md p-3 snap-center transition-all flex-shrink-0"
          style="scroll-snap-align: center;">
          <h4 class="font-semibold text-sm truncate">{{ rec.name }}</h4>
          <p class="text-xs text-gray-500 italic">{{ rec.strainType }}</p>
          <p class="text-xs text-gray-600">THC: {{ rec.thc }}%</p>
          <p class="text-xs text-gray-600">Price: {{ rec.price }}</p>
          <p class="text-xs text-gray-600">Weight: {{ rec.weight }}</p>

          <div v-if="rec.terpenes?.length" class="mt-1 text-xs text-gray-600">
            <p class="font-medium">Terpenes:</p>
            <ul class="list-disc list-inside">
              <li
                v-for="t in rec.terpenes
                  .filter(t => t.percentage > 0)
                  .sort((a, b) => {
                    if (a.rank != null && b.rank != null) return a.rank - b.rank
                    if (a.rank != null) return -1
                    if (b.rank != null) return 1
                    return a.name.localeCompare(b.name)
                  })"
                :key="t.id"
              >
                {{ t.name }} - {{ t.percentage }}%
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
