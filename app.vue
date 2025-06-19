<template>
  <div>
    <header class="flex justify-end p-4 bg-gray-100 shadow">
      <div v-if="session" class="relative">
        <button @click="toggleDropdown" class="cursor-pointer flex items-center space-x-2 focus:outline-none">
          <svg class="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"
            />
          </svg>
        </button>
        <div v-if="showDropdown" class="absolute right-0 mt-2 w-32 bg-white rounded shadow-md z-50">
          <button
            @click="logout"
            class="cursor-pointer block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSession } from '~/composables/useSession'
import { useLogout } from '~/composables/useLogout'

const showDropdown = ref(false)
function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

const { session, fetchSession } = useSession()
const { logout } = useLogout()

onMounted(() => {
  fetchSession()
})
</script>
