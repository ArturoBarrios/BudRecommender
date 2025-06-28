<script setup>
definePageMeta({ middleware: ['authenticated'] })

import NavTabs from '~/components/NavTabs.vue'
import { useStrainStore } from '~/stores/strains'
import { computed } from 'vue'

const strainStore = useStrainStore()
await strainStore.fetchStrains()

const brandOptions = computed(() => strainStore.brandOptions)
</script>

<template>
  <NavTabs />

  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Brands</h1>
    <ul class="space-y-3">
      <li
        v-for="brand in brandOptions"
        :key="brand.id"
        class="border rounded p-4 shadow-sm"
      >
        <div class="font-semibold">{{ brand.name }}</div>
        <div>Rank: {{ brand.rank ?? 'N/A' }}</div>
        <div>User Rank: {{ brand.userRank ?? 'N/A' }}</div>
      </li>
    </ul>
  </div>
</template>
