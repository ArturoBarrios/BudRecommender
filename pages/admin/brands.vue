<script setup>
definePageMeta({
  middleware: ['authenticated']
})

import { ref, watch } from 'vue'
import { useStrainStore } from '~/stores/strains'

const strainStore = useStrainStore()
await strainStore.fetchStrains()

const config = useRuntimeConfig()

// Clone brandOptions into reactive brands list for editing
const brands = ref([])

watch(
  () => strainStore.brandOptions,
  (newBrands) => {
    brands.value = newBrands.map(b => ({
      ...b,
      rank: b.rank !== null ? String(b.rank) : '',          // string for input binding
      userRank: b.userRank !== null ? String(b.userRank) : '', // same for userRank
    }))
  },
  { immediate: true }
)

async function saveBrandRank(brand) {
  try {
    const payload = {
      id: brand.id,
      name: brand.name,
      rank: brand.rank ? parseInt(brand.rank, 10) : null,
      userRank: brand.userRank ? parseInt(brand.userRank, 10) : null,  // include userRank
    }

    const result = await $fetch(`${config.public.serverUrl}/strains/update-brand`, {
      method: 'POST',
      body: payload,
    })

    if (result.success) {
      console.log('✅ Brand saved:', result.brand)
    } else {
      console.error('❌ Failed to save brand:', result.error)
    }
  } catch (err) {
    console.error('❌ Error saving brand:', err)
  }
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Admin: Brands</h1>

    <table class="w-full border border-gray-300 rounded-lg overflow-hidden">
      <thead class="bg-gray-100">
        <tr>
          <th class="text-left px-4 py-2 border-b">Brand</th>
          <th class="text-left px-4 py-2 border-b">Rank</th>
          <th class="text-left px-4 py-2 border-b">User Rank</th>  <!-- New header -->
          <th class="text-left px-4 py-2 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="brand in brands"
          :key="brand.id"
          class="hover:bg-gray-50"
        >
          <td class="px-4 py-2 border-b">
            <input
              v-model="brand.name"
              class="border px-2 py-1 rounded w-full"
              placeholder="Brand Name"
            />
          </td>
          <td class="px-4 py-2 border-b">
            <input
              v-model="brand.rank"
              type="number"
              class="border px-2 py-1 rounded w-24"
              placeholder="Rank"
              min="0"
            />
          </td>
          <td class="px-4 py-2 border-b">
            <input
              v-model="brand.userRank"
              type="number"
              class="border px-2 py-1 rounded w-24"
              placeholder="User Rank"
              min="0"
            />
          </td>
          <td class="px-4 py-2 border-b">
            <button
              @click="saveBrandRank(brand)"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
            >
              Save
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
