<template>
  <div>
    <PhotoCard v-for="image in images" :key="image.id" :image />
  </div>
</template>

<script setup lang="ts">
import { useImages } from '~/composables/useImages';
import type { ImageMeta } from '~/types/image';

const { getImages } = useImages();

const images = ref<ImageMeta[]>([]);

onMounted(async () => {
  images.value = await getImages();
});
</script>
