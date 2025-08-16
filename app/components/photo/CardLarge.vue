<template>
  <div class="relative w-full h-full">
    <div v-if="isViewingDetails">
      <PhotoDetails :image @delete="emit('delete')" />
    </div>
    <template v-else>
      <AppImage class="object-contain w-full h-full" :image />
    </template>

    <div class="absolute top-2 right-2 z-10">
      <button
        class="w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
        :title="isViewingDetails ? 'Hide Details' : 'Show Details'"
        @click="isViewingDetails = !isViewingDetails"
      >
        <Icon
          :name="`heroicons:${isViewingDetails ? 'x-circle' : 'information-circle'}`"
          class="w-4 h-4"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImageMeta } from '~/types/image';

const { image } = defineProps<{
  image: ImageMeta;
}>();

const emit = defineEmits<{
  delete: [];
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
