<script setup>
import { useSession } from '~/composables/useSession'
import { useStrainStore } from '~/stores/strains'

// Store props
const props = defineProps({
  showModal: Boolean,
  isLoading: Boolean,
  form: Object,
})

// Destructure props for local access
const { form } = props

// Emit events
const emit = defineEmits(['open', 'close', 'recommend'])

const { brandOptions } = storeToRefs(useStrainStore())
const { session } = useSession()

const selectedLikedIds = ref(new Set())
const selectedDislikedIds = ref(new Set())
const showAdvanced = ref(false)

const allTerpenes = [
  'Limonene', 'Myrcene', 'Caryophyllene', 'Linalool',
  'Pinene', 'Humulene', 'Terpinolene', 'Ocimene',
]

const likedPrefs = computed(() =>
  session.value?.preferences?.filter(p => p.liked && p.strain) || []
)

const dislikedPrefs = computed(() =>
  session.value?.preferences?.filter(p => !p.liked && p.strain) || []
)

watch(() => session.value, () => {
  selectedLikedIds.value = new Set(likedPrefs.value.map(p => p.strain.id))
  selectedDislikedIds.value = new Set(dislikedPrefs.value.map(p => p.strain.id))
})

function handleSubmit() {
  console.log('📨 Modal submitting with form:', form)
  form.selectedStrainIds = Array.from(selectedLikedIds)
  form.excludedStrainIds = Array.from(selectedDislikedIds)
  emit('recommend')
}
</script>


<template>
  <!-- Trigger Button -->
  <div class="fixed bottom-6 right-6 z-40">
    <button @click="$emit('open')"
      class="cursor-pointer bg-gradient-to-br from-emerald-500 via-fuchsia-600 to-rose-500 text-white font-extrabold py-3 px-7 rounded-full shadow-2xl border border-white/30 backdrop-blur-sm animate-pulse hover:brightness-110 hover:scale-105 transition-all duration-300">
      ✨ Recommendation
    </button>
  </div>

  <!-- Modal -->
  <div v-if="showModal"
    class="fixed bottom-6 right-6 z-50 w-80 max-w-full bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="flex justify-between items-center px-4 py-3 bg-green-500 text-white">
      <h2 class="font-semibold text-base">Bud AI Chat 🌿</h2>
      <button @click="$emit('close')" class="text-lg hover:text-gray-200">&times;</button>
    </div>

    <!-- AI Intro -->
    <div class="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 text-sm text-gray-800 max-h-64">
      <div class="bg-green-100 p-2 rounded-md self-start w-fit">
        Hi! What are you looking for today?
      </div>
      <div v-if="isLoading" class="text-gray-500">Thinking of a match for you...</div>
    </div>

    <!-- Form Fields -->
    <div class="px-3 py-2 border-t bg-white space-y-2 text-sm">
      <select v-model="form.mood" class="w-full border rounded px-2 py-1">
        <option disabled value="">Mood</option>
        <option value="happy">Happy</option>
        <option value="relaxed">Relaxed</option>
        <option value="sleep">Sleep</option>
        <option value="daytime">Daytime</option>
      </select>
      <select v-model="form.strainType" class="w-full border rounded px-2 py-1">
        <option disabled value="">Strain Type</option>
        <option value="Hybrid">Hybrid</option>
        <option value="Indica">Indica</option>
        <option value="Sativa">Sativa</option>
      </select>



      <select v-model="form.priceTier" class="w-full border rounded px-2 py-1">
        <option disabled value="">Price</option>
        <option value="low">&lt; $30</option>
        <option value="mid">$30 – $60</option>
        <option value="high">&gt; $60</option>
      </select>




      <!-- Toggle Advanced Settings -->
      <div class="text-right">
        <button @click="showAdvanced = !showAdvanced" class="cursor-pointer text-sm text-green-600 hover:underline">
          {{ showAdvanced ? 'Hide advanced settings ▲' : 'Show advanced settings ▼' }}
        </button>
      </div>

      <!-- Advanced Settings -->
      <div v-if="showAdvanced" class="space-y-4 mt-2">
        <!-- Terpenes -->
        <div>
          <label class="block font-semibold mb-1">Preferred Terpenes</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="terp in allTerpenes" :key="terp" @click.prevent="
              form.terpenes = form.terpenes || [];
            form.terpenes.includes(terp)
              ? form.terpenes = form.terpenes.filter(t => t !== terp)
              : form.terpenes.push(terp)
              " :class="[
                'px-2 py-1 rounded border text-xs',
                form.terpenes?.includes(terp)
                  ? 'bg-purple-200 border-purple-400'
                  : 'bg-white border-gray-300'
              ]">
              {{ terp }}
            </button>
          </div>
        </div>
        <!-- THC -->
        <select v-model="form.thcTier" class="w-full border rounded px-2 py-1">
          <option disabled value="">THC %</option>
          <option value="low">&lt; 20%</option>
          <option value="mid">20% – 25%</option>
          <option value="high">&gt; 25%</option>
        </select>

        <!-- Price -->
        <select v-model="form.weight" class="w-full border rounded px-2 py-1">
          <option disabled value="">Weight</option>
          <option value="2.83g">2.83g</option>
          <option value="5.66g">5.66g</option>
          <option value="14.15g">14.15g</option>
        </select>

        <!-- Brand Placeholder -->
        <div>
  <label class="block font-semibold mb-1">Brand</label>
  <select v-model="form.brand" class="w-full border rounded px-2 py-1">
    <option disabled value="">Select a brand</option>
    <option v-for="brand in brandOptions" :key="brand" :value="brand">
      {{ brand }}
    </option>
  </select>
</div>

        <!-- Favorites -->
        <div v-if="likedPrefs.length">
          <label class="block font-semibold mb-1">Based on Favorites</label>
          <div class="space-y-1">
            <div v-for="pref in likedPrefs" :key="pref.id"
              class="flex items-center justify-between border rounded px-2 py-1">
              <span class="truncate">{{ pref.strain.name }}</span>
              <button @click.prevent="
                selectedLikedIds.has(pref.strain.id)
                  ? selectedLikedIds.delete(pref.strain.id)
                  : selectedLikedIds.add(pref.strain.id)
                " class="text-sm">
                {{ selectedLikedIds.has(pref.strain.id) ? '❌' : '➕' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Disliked -->
        <div v-if="dislikedPrefs.length" class="mt-3">
          <label class="block font-semibold mb-1">Avoid These</label>
          <div class="space-y-1">
            <div v-for="pref in dislikedPrefs" :key="pref.id"
              class="flex items-center justify-between border rounded px-2 py-1">
              <span class="truncate">{{ pref.strain.name }}</span>
              <button @click.prevent="
                selectedDislikedIds.has(pref.strain.id)
                  ? selectedDislikedIds.delete(pref.strain.id)
                  : selectedDislikedIds.add(pref.strain.id)
                " class="text-sm">
                {{ selectedDislikedIds.has(pref.strain.id) ? '❌' : '➕' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input + Submit -->
    <form @submit.prevent="handleSubmit" class="z-40 flex gap-2 p-3 border-t bg-white">
      <input v-model="form.text" type="text" placeholder="Ask for a strain..."
        class="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
      <button type="submit" class="cursor-pointer bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded">
        Send
      </button>
    </form>
  </div>
</template>
