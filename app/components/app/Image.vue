<template>
  <img
    v-if="isLocal"
    :src="image.url"
    :alt="image.originalFilename || image.filename"
    v-bind="$attrs"
  />
  <NuxtImg
    v-else
    provider="cloudflare"
    :src="image.url"
    :alt="image.originalFilename || image.filename"
    :imgAttrs="$attrs"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import type { ImageMeta } from '~/types/image';

defineOptions({
  inheritAttrs: false,
});

const isLocal = ref<boolean>(import.meta.dev);

const { image } = defineProps<{
  image: ImageMeta;
}>();
</script>
