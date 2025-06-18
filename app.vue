<script setup>
const { fetchSession } = useSession()

if (process.client) {
  onMounted(() => {
    fetchSession()
  })
}
</script>

<template>
  <div>
    <NuxtLayout />
    <NuxtPage />
  </div>
</template>
