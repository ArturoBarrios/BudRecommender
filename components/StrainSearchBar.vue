<script setup>
const props = defineProps({
  modelValue: String
})
const emit = defineEmits(['update:modelValue'])

function onInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="mb-6">
    <input
      type="text"
      :value="modelValue"
      @input="onInput"
      placeholder="Search strains..."
      class="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  </div>
</template>
