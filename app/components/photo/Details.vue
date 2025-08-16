<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Image Details</h2>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Basic Information</h3>
        </div>
        <div class="divide-y divide-gray-200">
          <div v-if="image.description" class="px-4 py-3">
            <span class="text-sm font-medium text-gray-500 block mb-2">Description</span>
            <p class="text-sm text-gray-900">{{ image.description }}</p>
          </div>
          <div class="px-4 py-3 flex justify-between">
            <span class="text-sm font-medium text-gray-500">Uploaded</span>
            <span class="text-sm text-gray-900">{{ formatDate(image.uploadedAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column - Map Placeholder -->
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Location</h2>
      <div
        class="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center min-h-[400px] flex items-center justify-center"
      >
        <div class="text-gray-500">
          <p class="text-sm font-medium">Map will be displayed here</p>
          <p v-if="image.latitude && image.longitude" class="text-xs mt-2">
            Coordinates: {{ image.latitude }}, {{ image.longitude }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImageMeta } from '~/types/image';

const { image } = defineProps<{
  image: ImageMeta;
}>();

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};
</script>
