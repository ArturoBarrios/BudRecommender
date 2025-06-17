<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
    <h2 class="text-2xl font-semibold mb-4">Sign Up</h2>
    <form @submit.prevent="submitSignup">
      <div class="mb-4">
        <label class="block text-sm font-medium">Email</label>
        <input v-model="email" type="email" class="w-full border rounded p-2 mt-1" required />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium">Password</label>
        <input v-model="password" type="password" class="w-full border rounded p-2 mt-1" required />
      </div>
      <button type="submit" class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
        Create Account
      </button>
      <div v-if="error" class="mt-4 text-red-600 text-sm">{{ error }}</div>
<div v-if="success" class="mt-4 text-green-600 text-sm">Account created successfully!</div>

    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRuntimeConfig, useRouter } from '#app'

const email = ref('')
const password = ref('')
const error = ref('')
const success = ref(false)

const config = useRuntimeConfig()
const router = useRouter()

async function submitSignup() {
  error.value = ''
  success.value = false

  try {
    const response = await $fetch(`${config.public.serverUrl}/auth/signup`, {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })

    console.log('✅ Signed up user:', response.user)
    success.value = true

    // Automatically log them in
    const loginResponse = await $fetch(`${config.public.serverUrl}/auth/login`, {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })

    console.log('✅ Auto-login successful:', loginResponse.user)
    router.push('/')
  } catch (err) {
    error.value = err?.data?.error || err.message || 'Signup failed'
    console.error('❌ Signup error:', error.value)
  }
}
</script>
