<script setup>
import { ref, watch } from 'vue'
import { useStrainPreference } from '~/composables/useStrainPreference'
import { useSession } from '~/composables/useSession'

const props = defineProps({
  strain: Object,
  show: Boolean,
})

const emit = defineEmits(['close', 'preference-updated'])

const { session } = useSession()
const { createOrUpdatePreference, removePreference } = useStrainPreference()

const preference = ref(null) // 'like' | 'dislike' | null

watch(() => props.show, (val) => {
  if (val) {
    preference.value = null
  }
})

async function save() {
  if (!session.value?.id || !props.strain?.id) return

  if (preference.value === null) {
    await removePreference(props.strain.id)
  } else {
    const result = await createOrUpdatePreference({
      strainId: props.strain.id,
      liked: preference.value === 'like',
      reason: '',
      effectsFelt: [],
      symptomRelief: [],
    })
    if (result?.success) {
      emit('preference-updated', result.preference)
    }
  }

  emit('close')
}

</script>

<template>
  <div v-if="show" class="fixed inset-0 flex justify-center items-center z-50">
    <!-- Updated background overlay -->
    <div
      class="absolute inset-0"
      style="background-color: rgba(0, 0, 0, 0.1); backdrop-filter: blur(1px);"
      @click="$emit('close')"
    ></div>

    <div class="bg-white rounded-xl p-4 max-w-md w-full shadow-lg z-10">
      <h2 class="text-xl font-bold mb-2">Strain Preference</h2>

      <div class="mb-2">
        <label class="block text-sm font-semibold">Do you like this strain?</label>
        <select v-model="liked" class="mt-1 w-full border rounded p-1">
          <option :value="true">Like</option>
          <option :value="false">Dislike</option>
        </select>
      </div>

      <div class="mb-2">
        <label class="block text-sm font-semibold">Reason (optional)</label>
        <input v-model="reason" type="text" class="mt-1 w-full border rounded p-1" placeholder="Why did you feel this way?" />
      </div>

      <div class="mb-2">
        <label class="block text-sm font-semibold">Effects Felt</label>
        <div class="flex flex-wrap gap-2 mt-1">
          <button
            v-for="effect in allEffects"
            :key="effect"
            @click="toggleEffect(effect)"
            :class="[
              'px-2 py-1 rounded border text-sm',
              effects.includes(effect) ? 'bg-green-200 border-green-400' : 'bg-white border-gray-300'
            ]"
          >
            {{ effect }}
          </button>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <button @click="$emit('close')" class="text-gray-500 px-3 py-1">Cancel</button>
        <button @click="save" class="bg-green-600 text-white px-4 py-1 rounded">Save</button>
      </div>
    </div>
  </div>
</template>
