<template>
  <div id="map" ref="mapContainer" class="w-full h-full" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import type { MapOptions, Map as MapType, Marker } from 'maplibre-gl';
import logger from '~/utils/logger';

const {
  options = {
    center: [0, 0],
    zoom: 2,
  },
  markers = [],
} = defineProps<{
  options?: Partial<MapOptions>;
  markers?: Marker[];
}>();

let map: MapType | null = null;

const mapContainer = useTemplateRef<HTMLElement>('mapContainer');
const mapMarkers = ref<Marker[]>([]);

function handleSetMarkers(newMarkers: Marker[]): void {
  if (!map) {
    return;
  }

  mapMarkers.value.forEach((marker) => marker.remove());
  newMarkers.forEach((marker) => marker.addTo(map!));
}

onMounted(async () => {
  await nextTick();

  if (mapContainer.value == null) {
    logger.error('Map container does not exist');
    return;
  }

  const { Map } = await import('maplibre-gl');

  map = new Map({
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: options.center,
    zoom: options.zoom,
    container: mapContainer.value!,
  });

  handleSetMarkers(markers);

  logger.info('Map initialized');
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

watch(
  () => markers,
  (newMarkers) => {
    logger.info('Received markers', markers);
    handleSetMarkers(newMarkers);
  },
  {
    deep: true,
    immediate: true,
  },
);

watch(
  () => options,
  () => {
    if (options.center) {
      logger.info('Setting new map center');
      map?.setCenter(options.center);
    }

    if (options.zoom) {
      logger.info('Setting new map zoom');
      map?.setZoom(options.zoom);
    }
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>

<style>
@import 'maplibre-gl/dist/maplibre-gl.css';
</style>
