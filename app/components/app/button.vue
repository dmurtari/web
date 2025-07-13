<script setup lang="ts">
const { type = 'button', disabled } = defineProps<{
  type?: HTMLButtonElement["type"];
  disabled?: boolean;
}>();
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 hover:cursor-pointer"
  >
    <slot />
  </button>
</template>