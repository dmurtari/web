<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Image Details</h2>

      <div
        v-if="isAuthenticated"
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Admin</h3>
        </div>

        <div class="px-4 py-3">
          <AppButton variant="danger" @click="emit('delete')"> Delete </AppButton>
        </div>

        <div class="px-4 py-3 space-y-3 flex justify-between gap-1">
          <input
            v-model="description"
            type="text"
            class="w-full h-full px-3 py-2 mb-0 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Description"
          />
          <AppButton @click="emit('update:description', description)"> Save </AppButton>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">EXIF Information</h3>
        </div>
        <div class="divide-y divide-gray-200">
          <div v-if="image.description" class="px-4 py-3">
            <span class="text-sm font-medium text-gray-500 block mb-2">Description</span>
            <p class="text-sm text-gray-900">{{ image.description }}</p>
          </div>
          <div v-if="image.takenAt" class="px-4 py-3 flex justify-between">
            <span class="text-sm font-medium text-gray-500">Taken</span>
            <span class="text-sm text-gray-900">{{ formatDate(image.takenAt) }}</span>
          </div>
          <div v-if="image.aperture" class="px-4 py-3 flex justify-between">
            <span class="text-sm font-medium text-gray-500">Aperture</span>
            <span class="text-sm text-gray-900"> f/{{ image.aperture }}</span>
          </div>
          <div v-if="image.iso" class="px-4 py-3 flex justify-between">
            <span class="text-sm font-medium text-gray-500">ISO</span>
            <span class="text-sm text-gray-900">{{ image.iso }}</span>
          </div>
          <div v-if="image.focalLength" class="px-4 py-3 flex justify-between">
            <span class="text-sm font-medium text-gray-500">Focal Length (35mm equivalent)</span>
            <span class="text-sm text-gray-900">{{ image.focalLength }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Location</h2>
      <div class="rounded-lg border-2 border-gray-300 h-[500px] min-w-[400px] overflow-hidden">
        <ClientOnly>
          <PhotoMap :options="mapOptions" :markers="mapMarkers" />
          <template #fallback>
            <div class="w-full h-full flex items-center justify-center bg-gray-100">
              <div class="text-gray-500">Loading map...</div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MapOptions } from 'maplibre-gl';
import { Marker } from 'maplibre-gl';

import type { ImageMeta } from '~/types/image';

const { image } = defineProps<{
  image: ImageMeta;
}>();

const emit = defineEmits<{
  delete: [];
  'update:description': [string];
}>();

const { isAuthenticated } = usePermissions();
const { description } = useDescriptionForm(image);

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

const mapOptions = computed<Partial<MapOptions>>(() => ({
  center: [Number(image.longitude), Number(image.latitude)],
  zoom: 9,
}));

const mapMarkers = computed<Marker[]>(() => [
  new Marker().setLngLat([Number(image.longitude), Number(image.latitude)]),
]);

function useDescriptionForm(imageRef: MaybeRef<ImageMeta>) {
  const description = ref<string>('');

  watch(
    () => imageRef,
    () => {
      const image = toValue(imageRef);
      description.value = image.description ?? '';
    },
  );

  return {
    description,
  };
}
</script>
