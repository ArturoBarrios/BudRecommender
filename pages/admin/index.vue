<script setup>
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useStrainStore } from '~/stores/strains'
import StrainCard from '~/components/StrainCard.vue'

const strainStore = useStrainStore()
const { allStrains, pending, error } = storeToRefs(strainStore)

onMounted(() => {
  strainStore.fetchStrains()
})

function handleEdit(strain) {
  console.log('Editing strain:', strain)
  // You could navigate to another page or open a modal
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Edit Strains</h1>

    <div v-if="pending">Loading strains...</div>
    <div v-else-if="error">Failed to load strains.</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StrainCard
        v-for="strain in allStrains"
        :key="strain.id"
        :strain="strain"
        :showEditButton="true"
        @edit="handleEdit"
      />
    </div>
  </div>
</template>
