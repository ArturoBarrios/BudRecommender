<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

function goTo(path) {
  router.push(path)
}
</script>

<template>
  <nav class="bg-gray-100 p-4 flex items-center space-x-6 border-b max-w-6xl mx-auto">
    <button
      @click="goTo('/')"
      :class="['cursor-pointer font-semibold', route.path === '/' ? 'text-blue-600' : 'text-gray-600']"
    >
      Strains
    </button>

    
  </nav>
</template>
