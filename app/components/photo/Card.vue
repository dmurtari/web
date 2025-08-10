<template>
  <div>
    <AppImage v-if="image.url" :image />
    <div v-else>No image preview available</div>
  </div>
</template>

<script setup lang="ts">
import type { ImageMeta } from '~/types/image';

const { image } = defineProps<{ image: ImageMeta }>();
// const { isAuthenticated } = usePermissions();

// const emit = defineEmits<{
//   (e: 'delete'): void;
// }>();

// async function handleImageDelete(): Promise<void> {
//   emit('delete');
// }
</script>
