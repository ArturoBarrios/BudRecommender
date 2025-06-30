<script setup>
import { ref, computed } from 'vue'
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
})

const emit = defineEmits(['preference-updated'])

const showModal = ref(false)
const showPreferencePopup = ref(false)
const isEditing = ref(false)

const isFavorite = computed(() => {
  return session.value?.preferences?.some(p => p.strainId === props.strain.id && p.liked === true)
})

const isDisliked = computed(() => {
  return session.value?.preferences?.some(p => p.strainId === props.strain.id && p.liked === false)
})

const editableTerpenes = computed(() => {
  return props.strain.terpenes?.length
    ? props.strain.terpenes.map(t => ({ ...t }))
    : strainStore.terpeneOptions.map(name => ({ name, percentage: 0, id: name }))
})

async function updatePreference(value) {
  if (!session.value?.id) return

  const liked = value === null ? null : value === 'like'

  const result = await setPreference({ strainId: props.strain.id, liked })

  if (!result?.success) {
    console.error('Failed to set preference')
    return
  }

  const idx = session.value.preferences.findIndex(p => p.strainId === props.strain.id)
  if (liked === null) {
    if (idx !== -1) session.value.preferences.splice(idx, 1)
  } else {
    if (idx !== -1) {
      session.value.preferences[idx].liked = liked
    } else {
      session.value.preferences.push({ strainId: props.strain.id, liked })
    }
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
  if (result.success) {
    console.log('🎉 Strain saved!')
  } else {
    console.error('❌ Could not save strain:', result.error)
  }
}

function handlePreferenceUpdate(updatedPreference) {
  const idx = session.value.preferences.findIndex(p => p.strainId === props.strain.id)
  if (idx !== -1) {
    session.value.preferences[idx] = updatedPreference
  } else {
    session.value.preferences.push(updatedPreference)
  }
}
</script>

<template>
  <div class="border rounded-xl p-4 shadow-sm hover:shadow-md transition relative">

    <!-- Heart + Popup -->
    <button
      @click.stop="showPreferencePopup = !showPreferencePopup"
      class="heart-button absolute top-3 right-3 text-2xl cursor-pointer select-none"
      aria-label="Toggle preference"
      type="button"
    >
      <span v-if="isFavorite">💚</span>
      <span v-else-if="isDisliked">🖤</span>
      <span v-else>🤍</span>
    </button>

    <div
      v-if="showPreferencePopup"
      class="preference-popup absolute top-10 right-3 z-30 bg-white border border-gray-300 rounded shadow-md px-3 py-2 flex gap-2"
    >
      <button
        @click="updatePreference('like')"
        type="button"
        class="text-sm font-bold px-3 py-1 rounded transition"
        :class="isFavorite ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'"
      >
        💚
      </button>
      <button
        @click="updatePreference('dislike')"
        type="button"
        class="text-sm font-bold px-3 py-1 rounded transition"
        :class="isDisliked ? 'bg-black text-white' : 'bg-gray-100 text-black hover:bg-gray-300'"
      >
        🖤
      </button>
      <button
        @click="updatePreference(null)"
        type="button"
        class="text-sm font-bold px-3 py-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition"
      >
        ❌
      </button>
    </div>

    <!-- Strain Info -->
    <h2 class="text-xl font-semibold">{{ strain.name }}</h2>
    <h3 v-if="strain.brand?.name" class="text-sm text-gray-500 italic">{{ strain.brand.name }}</h3>

    <div v-if="strain.specialOffer" class="bg-yellow-300 text-yellow-900 px-2 py-1 text-xs font-semibold rounded">
      🎉 {{ strain.specialOffer }}
    </div>

    <p class="text-sm text-gray-600 italic">{{ strain.strainType }}</p>
    <p class="text-sm text-gray-700 mt-1">THC: {{ strain.thc }}%</p>
    <p class="text-sm text-gray-700">Price: {{ strain.price }}</p>
    <p class="text-sm text-gray-700">Weight: {{ strain.weight }}</p>

    <!-- Terpenes -->
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
            @click="handleStrainUpdate({ ...strain, terpenes: editableTerpenes }, strain.store?.name)"
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

    <!-- Modal (still works if needed) -->
    <StrainPreferenceModal
      :strain="strain"
      :show="showModal"
      @close="showModal = false"
      @preference-updated="handlePreferenceUpdate"
    />
  </div>
</template>
