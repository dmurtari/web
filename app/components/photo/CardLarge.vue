<template>
  <div class="relative w-full h-full">
    <div v-if="isViewingDetails">Details</div>
    <template v-else>
      <AppImage class="object-contain w-full h-full" :image />

      <div class="absolute top-0 right-0 z-10">
        <button @click="isViewingDetails = !isViewingDetails">
          {{ isViewingDetails ? 'Hide Details' : 'Show Details' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ImageMeta } from '~/types/image';

const { image } = defineProps<{
  image: ImageMeta;
}>();

const { isViewingDetails } = useViewDetail();

function useViewDetail() {
  const isViewingDetails = ref<boolean>(false);

  watch(
    () => image,
    () => {
      isViewingDetails.value = false;
    },
  );

  return {
    isViewingDetails,
  };
}
</script>
