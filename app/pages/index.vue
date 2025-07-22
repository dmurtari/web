<template>
  <div>
    {{ images }}
  </div>
</template>

<script setup lang="ts">
import { useImages } from '~/composables/useImages';

const { getImages } = useImages();

const images = ref([]);

onMounted(async () => {
  await getImages();
});
</script>
