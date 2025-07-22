<template>
  <button
    :type="type"
    :disabled="disabled"
    class="rounded disabled:opacity-50 hover:cursor-pointer disabled:hover:cursor-not-allowed transition-colors duration-200"
    :class="[
      {
        'bg-blue-500 text-white hover:bg-blue-600': variant === 'primary',
        'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
        'bg-red-500 text-white hover:bg-red-600': variant === 'danger',
        'bg-transparent hover:bg-gray-100': variant === 'transparent',
      },
      {
        'px-2 py-1 text-sm': size === 'small',
        'px-4 py-2': size === 'medium',
        'px-6 py-3 text-lg': size === 'large',
      },
    ]"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const {
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
} = defineProps<{
  type?: HTMLButtonElement['type'];
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'transparent';
  size?: 'small' | 'medium' | 'large';
}>();
</script>
