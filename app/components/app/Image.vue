<template>
  <div>
    <img v-if="isLocal" :src="image.url" :alt="image.originalFilename || image.filename" />
    <NuxtPicture v-else :src="image.url" :alt="image.originalFilename || image.filename" />
  </div>
</template>

<script setup lang="ts">
import type { ImageMeta } from '~/types/image';

const isLocal = ref<boolean>(import.meta.dev);

const { image } = defineProps<{ image: ImageMeta }>();
</script>
