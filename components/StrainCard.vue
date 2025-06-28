<script setup>
import { ref, computed } from 'vue'
import { useSession } from '~/composables/useSession'
import { useStrainStore } from '~/stores/strains'
import StrainPreferenceModal from '~/components/StrainPreferenceModal.vue'
import { useUpsertStrain } from '~/composables/useUpsertStrain'
const { upsertStrain } = useUpsertStrain()

const props = defineProps({
  strain: Object,
})

const { session } = useSession()
const showModal = ref(false)
const isEditing = ref(false)

const strainStore = useStrainStore()
const terpeneOptions = computed(() => strainStore.terpeneOptions)

const editableTerpenes = ref(
  props.strain.terpenes?.length
    ? props.strain.terpenes.map(t => ({ ...t })) // clone to avoid mutating prop
    : terpeneOptions.value.map(name => ({
        name,
        percentage: 0,
        id: name,
      }))
)

async function handleStrainUpdate(updatedStrain) {
  console.log('Updating strain:', updatedStrain)
  const result = await upsertStrain(updatedStrain)
  if (result.success) {
    console.log('🎉 Strain saved!')
  } else {
    console.error('❌ Could not save strain:', result.error)
  }
}

async function saveTerpenes() {
  const nonZeroTerpenes = editableTerpenes.value
    .filter(t => parseFloat(t.percentage) > 0)
    .map(t => ({
      name: t.name,
      percentage: parseFloat(t.percentage),
      id: t.id,
    }))

  const updatedStrain = {
    ...props.strain,
    terpenes: nonZeroTerpenes,
  }

  await handleStrainUpdate(updatedStrain)
  isEditing.value = false
}

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

    <div class="mt-2 text-xs text-gray-600">
  <p class="font-medium">Terpenes:</p>

  <template v-if="!isEditing">
    <ul v-if="strain.terpenes?.length" class="list-disc list-inside">
      <li v-for="terpene in strain.terpenes" :key="terpene.id">
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
    <div
      v-for="terpene in editableTerpenes"
      :key="terpene.id"
      class="flex items-center space-x-2 mt-1"
    >
      <span class="w-28 truncate">{{ terpene.name }}</span>
      <input
        type="number"
        v-model="terpene.percentage"
        class="border px-1 py-0.5 text-xs w-20 rounded"
        min="0"
        max="100"
        step="0.1"
      />
      <span class="text-xs text-gray-500">%</span>
    </div>

    <div class="mt-2 space-x-2">
  <button
    @click="saveTerpenes"
    class="bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700"
  >
    Save
  </button>
  <button
    @click="isEditing = false"
    class="text-xs text-gray-500 underline"
  >
    Cancel
  </button>
</div>

  </template>
</div>


    <StrainPreferenceModal
      :strain="strain"
      :show="showModal"
      @close="showModal = false"
      @preference-updated="handlePreferenceUpdate"
    />
  </div>
</template>
