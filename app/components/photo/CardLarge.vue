<template>
  <AppImage
    class="object-contain max-h-full max-w-full"
    :image
    :maxWidth="1920"
    :maxHeight="1080"
    :quality="90"
    fit="contain"
  />
</template>

<script setup lang="ts">
import type { ImageMeta } from '~/types/image';

const { image } = defineProps<{
  image: ImageMeta;
}>();
</script>
