<script setup>
const props = defineProps({
  showModal: Boolean,
  isLoading: Boolean,
  form: Object,
})

const emit = defineEmits(['open', 'close', 'submit'])
</script>

<template>
  <!-- Trigger Button -->
  <div class="fixed bottom-6 right-6 z-40">
    <button
      @click="$emit('open')"
      class="cursor-pointer bg-gradient-to-br from-emerald-500 via-fuchsia-600 to-rose-500 text-white font-extrabold py-3 px-7 rounded-full shadow-2xl border border-white/30 backdrop-blur-sm animate-pulse hover:brightness-110 hover:scale-105 transition-all duration-300"
    >
      ✨ Recommendation
    </button>
  </div>

  <!-- Modal -->
  <div
    v-if="showModal"
    class="fixed bottom-6 right-6 z-50 w-80 max-w-full bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
  >
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
      <select v-model="form.strainType" class="w-full border rounded px-2 py-1">
        <option disabled value="">Strain Type</option>
        <option value="Hybrid">Hybrid</option>
        <option value="Indica">Indica</option>
        <option value="Sativa">Sativa</option>
      </select>

      <select v-model="form.thcTier" class="w-full border rounded px-2 py-1">
        <option disabled value="">THC %</option>
        <option value="low">&lt; 20%</option>
        <option value="mid">20% – 25%</option>
        <option value="high">&gt; 25%</option>
      </select>

      <select v-model="form.priceTier" class="w-full border rounded px-2 py-1">
        <option disabled value="">Price</option>
        <option value="low">&lt; $30</option>
        <option value="mid">$30 – $60</option>
        <option value="high">&gt; $60</option>
      </select>

      <select v-model="form.weight" class="w-full border rounded px-2 py-1">
        <option disabled value="">Weight</option>
        <option value="2.83g">2.83g</option>
        <option value="5.66g">5.66g</option>
        <option value="14.15g">14.15g</option>
      </select>

      <select v-model="form.mood" class="w-full border rounded px-2 py-1">
        <option disabled value="">Mood</option>
        <option value="happy">Happy</option>
        <option value="relaxed">Relaxed</option>
        <option value="sleep">Sleep</option>
        <option value="daytime">Daytime</option>
      </select>
    </div>

    <!-- Text Input & Submit -->
    <form @submit.prevent="$emit('submit')" class="z-40 flex gap-2 p-3 border-t bg-white">
      <input
        v-model="form.text"
        type="text"
        placeholder="Ask for a strain..."
        class="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <button type="submit" class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded">
        Send
      </button>
    </form>
  </div>
</template>
