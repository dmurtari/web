<template>
  <div>
    <PhotoCard v-for="image in images" :key="image.id" :image @delete="deleteImage(image.id)" />
  </div>
</template>

<script setup lang="ts">
import { useImages } from '~/composables/useImages';

const { images, deleteImage, getImages } = useImages();

onMounted(async () => {
  await getImages();
});
</script>
