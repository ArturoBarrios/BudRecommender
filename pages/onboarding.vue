<script setup lang="ts">
import StrainCard from '~/components/StrainCard.vue'
import { useStrains } from '~/composables/useStrains'

const { allStrains, pending, error } = useStrains()

const favorites = ref(new Set())

function toggleFavorite(id: string) {
  if (favorites.value.has(id)) {
    favorites.value.delete(id)
  } else {
    favorites.value.add(id)
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-4">Welcome! Choose Your Favorite Strains 🌿</h1>

    <div v-if="pending" class="text-gray-500">Loading strains...</div>
    <div v-else-if="error" class="text-red-600">Failed to load strains.</div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <StrainCard
        v-for="strain in allStrains"
        :key="strain.id"
        :strain="strain"
        :is-favorite="favorites.has(strain.id)"
        @toggle-favorite="toggleFavorite"
      />
    </div>

    <div class="mt-10 text-center">
      <button
        class="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition"
        @click="console.log([...favorites])"
      >
        Continue ({{ favorites.size }} Selected)
      </button>
    </div>
  </div>
</template>
