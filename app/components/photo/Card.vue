<template>
  <div
    class="h-full transition-all duration-200 flex items-center justify-center"
    :class="{
      'border-2 border-blue-500 bg-blue-50/10': active,
    }"
  >
    <AppImage
      v-if="image.url"
      class="max-h-full max-w-full object-contain"
      :image
      :maxHeight="150"
      :quality="70"
      fit="contain"
    />
  </div>
</template>

<script setup lang="ts">
import type { ImageMeta } from '~/types/image';

const { image, active = false } = defineProps<{ image: ImageMeta; active?: boolean }>();
</script>
