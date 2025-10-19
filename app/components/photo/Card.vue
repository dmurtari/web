<template>
  <div
    class="h-100 transition-all duration-200"
    :class="{
      'border-2 border-blue-500 bg-blue-50/10': active,
    }"
  >
    <AppImage
      v-if="image.url"
      class="max-h-full max-w-full"
      :image
      :maxHeight="150"
      :quality="70"
      fit="contain"
      sizes="400px"
    />
  </div>
</template>

<script setup lang="ts">
import type { ImageMeta } from '~/types/image';

const { image, active = false } = defineProps<{ image: ImageMeta; active?: boolean }>();
</script>
