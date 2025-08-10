<template>
  <div class="flex items-center justify-center min-h-screen w-full p-4">
    <div
      class="relative max-w-4xl w-full h-auto rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 shadow-xl hover:shadow-2xl"
    >
      <div
        class="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm z-10 rounded-2xl border border-white/20"
      />

      <div class="relative z-20 p-6 bg-black/30 backdrop-blur-md flex flex-col">
        <div class="w-full overflow-hidden rounded-xl shadow-inner mb-5">
          <AppImage
            v-if="image.url"
            :image
            class="w-full h-auto object-cover transition-transform duration-500"
          />
          <div v-else class="w-full h-64 bg-gray-800 flex items-center justify-center text-white">
            No image preview available
          </div>
        </div>

        <div class="space-y-4 text-white">
          <h2 class="text-2xl font-semibold truncate">
            {{ image.originalFilename || image.filename }}

            <AppButton v-if="isAuthenticated" @click="handleImageDelete"> Delete </AppButton>
          </h2>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <p class="text-sm text-white/70">Uploaded</p>
              <p>{{ new Date(image.uploadedAt).toLocaleString() }}</p>
            </div>

            <div class="space-y-2">
              <p class="text-sm text-white/70">File size</p>
              <p>{{ image.size }}</p>
            </div>
          </div>

          <div v-if="image.description" class="pt-2 border-t border-white/10">
            <p class="text-sm text-white/70">Description</p>
            <p class="mt-1">{{ image.description }}</p>
          </div>

          <div v-if="image.latitude && image.longitude" class="pt-2 border-t border-white/10">
            <p class="text-sm text-white/70">Location</p>
            <p class="mt-1">{{ image.latitude }}, {{ image.longitude }}</p>
          </div>
        </div>
      </div>

      <div class="absolute -bottom-2 left-2 right-2 h-6 bg-black/20 blur-md rounded-full z-0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImageMeta } from '~/types/image';

const { image } = defineProps<{ image: ImageMeta }>();
const { isAuthenticated } = usePermissions();

const emit = defineEmits<{
  (e: 'delete'): void;
}>();

async function handleImageDelete(): Promise<void> {
  emit('delete');
}
</script>
