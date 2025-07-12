<template>
  <div ref="mapContainer" class="w-full h-full" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import type { Map as MapType } from "maplibre-gl";

let map: MapType | null = null;
const mapContainer = useTemplateRef<HTMLElement>("mapContainer");

onMounted(async () => {
  if (mapContainer.value == null) {
    console.error("Map container does not exist");
  }

  const { Map } = await import("maplibre-gl");

  map = new Map({
    container: mapContainer.value!,
    style: "https://demotiles.maplibre.org/style.json",
    center: [0, 0],
    zoom: 2,
  });
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>

<style>
@import "maplibre-gl/dist/maplibre-gl.css";
</style>
