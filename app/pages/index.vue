<template>
  <div class="h-full w-full flex flex-col bg-gray-200">
    <!-- Photo Display -->
    <div class="flex-1 flex items-center justify-center p-4 overflow-hidden">
      <AppImage
        v-if="activeImage"
        :image="activeImage"
        class="max-w-full max-h-full object-contain"
      />
      <div v-else class="text-gray-500 text-lg">Click an image to view</div>
    </div>

    <!-- Photo Scroller -->
    <div class="h-40 border-t border-gray-500 bg-gray-50 p-4 flex-shrink-0">
      <div class="scrollable-photos overflow-x-scroll flex flex-nowrap h-full gap-1">
        <PhotoCard
          v-for="image in images"
          :key="image.id"
          class="cursor-pointer h-full flex-shrink-0 nap-center"
          :image
          :active="image.id === activeImage?.id"
          @delete="deleteImage(image.id)"
          @click="handleClickImage(image)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useImages } from '~/composables/useImages';
import type { ImageMeta } from '~/types/image';

const { images, deleteImage } = useImages();
const { activeImage, handleClickImage } = useImageCarousel();

function useImageCarousel() {
  const { getImages } = useImages();

  const activeImage = useState<ImageMeta | null>('activeImage', () => null);

  function handleClickImage(image: ImageMeta): void {
    activeImage.value = image;
  }

  onMounted(async () => {
    const images = await getImages();
    if (images[0]) {
      activeImage.value = images[0];
    }
  });

  return {
    activeImage,
    handleClickImage,
  };
}
</script>

<style scoped>
@property --left-fade {
  syntax: '<length>';
  inherits: false;
  initial-value: 0;
}

@property --right-fade {
  syntax: '<length>';
  inherits: false;
  initial-value: 0;
}

@keyframes scrollfade {
  0% {
    --left-fade: 0;
  }
  10%,
  100% {
    --left-fade: 1rem;
  }
  0%,
  90% {
    --right-fade: 1rem;
  }
  100% {
    --right-fade: 0;
  }
}

.scrollable-photos {
  mask: linear-gradient(
    to right,
    #0000,
    #ffff var(--left-fade) calc(100% - var(--right-fade)),
    #0000
  );
  animation: scrollfade;
  animation-timeline: --scrollfade;
  scroll-timeline: --scrollfade x;
  scroll-snap-type: x mandatory;
}
</style>
