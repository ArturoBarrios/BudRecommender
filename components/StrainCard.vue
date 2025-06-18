<script setup>
const props = defineProps({
  strain: Object,
  isFavorite: Boolean,
})

const emit = defineEmits(['toggle-favorite'])

function toggle() {
  emit('toggle-favorite', strain.id)
}
</script>

<template>
  <div class="border rounded-xl p-4 shadow-sm hover:shadow-md transition relative">
    <button @click="toggle" class="absolute top-3 right-3 text-2xl">
      <span v-if="isFavorite">💚</span>
      <span v-else>🤍</span>
    </button>

    <!-- Special Offer -->
    
    <h2 class="text-xl font-semibold">{{ strain.name }}</h2>
    <h3 v-if="strain.brand?.name" class="text-sm text-gray-500 italic">{{ strain.brand.name }}</h3>
    <div v-if="strain.specialOffer" class=" bg-yellow-300 text-yellow-900 px-2 py-1 text-xs font-semibold rounded">
      🎉 {{ strain.specialOffer }}
    </div>
    <p class="text-sm text-gray-600 italic">{{ strain.strainType }}</p>
    <p class="text-sm text-gray-700 mt-1">THC: {{ strain.thc }}%</p>
    <p class="text-sm text-gray-700">Price: {{ strain.price }}</p>
    <p class="text-sm text-gray-700">Weight: {{ strain.weight }}</p>

    <div v-if="strain.terpenes?.length" class="mt-2 text-xs text-gray-600">
      <p class="font-medium">Terpenes:</p>
      <ul class="list-disc list-inside">
        <li v-for="terpene in strain.terpenes" :key="terpene.id">
          {{ terpene.name }} - {{ terpene.percentage }}%
        </li>
      </ul>
    </div>
  </div>
</template>
