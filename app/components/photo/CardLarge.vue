<template>
  <AppImage class="object-contain max-h-full max-w-full" :image />
</template>

<script setup lang="ts">
import type { ImageMeta } from '~/types/image';

const { image } = defineProps<{
  image: ImageMeta;
}>();
</script>
