<template>
  <div class="h-full w-full flex flex-col bg-gray-200">
    <!-- Photo Display -->
    <div class="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
      <template v-if="activeImage">
        <PhotoDetails
          v-if="isViewingDetails"
          class="w-full h-full"
          :image="activeImage"
          @delete="handleDeleteImage(activeImage.id)"
          @update:description="handleUpdateDescription"
        />
        <PhotoCardLarge v-else :image="activeImage" />

        <div class="absolute top-2 right-2 z-10">
          <button
            class="w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            :title="isViewingDetails ? 'Hide Details' : 'Show Details'"
            @click="handleViewDetails"
          >
            <Icon
              :name="`heroicons:${isViewingDetails ? 'x-circle' : 'information-circle'}`"
              class="w-4 h-4"
            />
          </button>
        </div>
      </template>
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
          @click="handleClickImage(image)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useImages } from '~/composables/useImages';
import type { ImageMeta } from '~/types/image';

useHead({
  title: 'Photo Gallery',
});

const {
  images,
  activeImage,

  isViewingDetails,
  handleClickImage,
  handleViewDetails,
  handleDeleteImage,
  handleUpdateDescription,
} = useImageGallery();

function useImageGallery() {
  const { images, getImages, deleteImage, patchImage } = useImages();

  const activeImage = useState<ImageMeta | null>('activeImage', () => null);
  const isViewingDetails = ref<boolean>(false);

  function handleClickImage(image: ImageMeta): void {
    activeImage.value = image;
  }

  function handleViewDetails() {
    isViewingDetails.value = !isViewingDetails.value;
  }

  async function handleDeleteImage(imageId: string): Promise<void> {
    const deleteIndex = images.value.findIndex((image) => image.id === imageId);

    await deleteImage(imageId);

    if (images.value[deleteIndex]) {
      activeImage.value = images.value[deleteIndex];
    } else {
      activeImage.value = null;
    }
  }

  async function handleUpdateDescription(description: string): Promise<void> {
    if (!activeImage.value?.id) {
      return;
    }

    await patchImage(activeImage.value.id, { description });
  }

  onMounted(async () => {
    const images = await getImages();
    if (images[0]) {
      activeImage.value = images[0];
    }
  });

  return {
    images,
    activeImage,
    isViewingDetails,

    handleClickImage,
    handleViewDetails,
    handleDeleteImage,
    handleUpdateDescription,
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
