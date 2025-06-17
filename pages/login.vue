<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
    <h2 class="text-2xl font-semibold mb-4">Login</h2>
    <form @submit.prevent="submitLogin">
      <div class="mb-4">
        <label class="block text-sm font-medium">Email</label>
        <input v-model="email" type="email" class="w-full border rounded p-2 mt-1" required />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium">Password</label>
        <input v-model="password" type="password" class="w-full border rounded p-2 mt-1" required />
      </div>
      <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        Log In
      </button>

      <div v-if="error" class="mt-4 text-red-600 text-sm">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRuntimeConfig } from '#app'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const config = useRuntimeConfig()

async function submitLogin() {
  error.value = ''

  try {
    const response = await $fetch(`${config.public.serverUrl}/auth/login`, {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })

    console.log('✅ Logged in user:', response.user)
    router.push('/')
  } catch (err) {
    error.value = err?.data?.error || err.message || 'Login failed'
    console.error('❌ Login error:', error.value)
  }
}
</script>
