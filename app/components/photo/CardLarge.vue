<template>
  <AppImage class="object-contain w-full h-full" :image />
</template>

<script setup lang="ts">
import type { ImageMeta } from '~/types/image';

const { image } = defineProps<{
  image: ImageMeta;
}>();
</script>
