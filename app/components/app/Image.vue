<template>
  <!-- Hidden image to trigger loading -->
  <img
    v-if="!imageLoaded"
    :src="transformedSrc || image.url"
    :alt="image.originalFilename || image.filename"
    class="absolute inset-0 opacity-0 pointer-events-none"
    @load="handleLoad"
  />

  <!-- Visible image when loaded -->
  <img
    v-if="imageLoaded"
    :src="transformedSrc || image.url"
    :alt="image.originalFilename || image.filename"
    class="transition-opacity duration-300 opacity-100"
    v-bind="$attrs"
  />

  <!-- LQIP placeholder while loading -->
  <div
    v-if="!imageLoaded && image.lqip"
    :style="{
      '--lqip': image.lqip,
    }"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import type { ImageMeta } from '~/types/image';

defineOptions({
  inheritAttrs: false,
});

interface Props {
  image: ImageMeta;
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  fit?: 'contain' | 'cover' | 'crop' | 'scale-down';
}

const {
  image,
  width = undefined,
  height = undefined,
  maxWidth = undefined,
  maxHeight = undefined,
  quality = 80,
  fit = 'contain',
} = defineProps<Props>();

const useCloudflareTransforms = computed(() => {
  return !import.meta.dev && image.url?.includes('images.kazusan.me');
});

const transformedSrc = computed(() => {
  if (!useCloudflareTransforms.value || !image.url) {
    return null;
  }

  const params = [];

  params.push('f=webp');
  params.push(`q=${quality}`);
  params.push(`fit=${fit}`);

  if (width) params.push(`w=${width}`);
  if (height) params.push(`h=${height}`);
  if (maxWidth && !width) params.push(`w=${maxWidth}`);
  if (maxHeight && !height) params.push(`h=${maxHeight}`);

  const transformParams = params.join(',');
  const urlPath = image.url.replace('https://images.kazusan.me', '');
  const transformUrl = `https://images.kazusan.me/cdn-cgi/image/${transformParams}${urlPath}`;
  return transformUrl;
});

const imageLoaded = ref(false);

function handleLoad() {
  imageLoaded.value = true;
}

watch(
  () => transformedSrc.value || image.url,
  () => {
    imageLoaded.value = false;
  },
);
</script>

<style scoped>
/* https://github.com/frzi/lqip-css/ */

[data-lqip] {
  --lqip-c: attr(data-lqip type(<color>), white);
}

[style*='--lqip:'] {
  --lqip-c: var(--lqip);
}

[style*='--lqip:'],
[data-lqip] {
  --lqip-c0: color(
    from var(--lqip-c) srgb calc(round(down, r * 255 / pow(2, 4)) / 15)
      calc(mod(round(down, r * 255), pow(2, 4)) / 15) calc(round(down, g * 255 / pow(2, 5)) / 7) / 1
  );

  --lqip-c1: color(
    from var(--lqip-c) srgb calc(mod(round(down, g * 255 / 2), pow(2, 4)) / 15)
      calc(((mod(round(down, g * 255), 2) * pow(2, 3)) + (round(down, b * 255 / pow(2, 5)))) / 15)
      calc(mod(round(down, b * 255 / pow(2, 2)), pow(2, 3)) / 7) / 1
  );

  --lqip-c2: color(
    from var(--lqip-c) srgb
      calc(
        (((mod(round(down, b * 255), pow(2, 2)) * 2)) + round(down, alpha * 255 / pow(2, 7))) / 7
      )
      calc(mod(round(down, alpha * 255 / pow(2, 3)), pow(2, 4)) / 15)
      calc(mod(round(down, alpha * 255), pow(2, 3)) / 7) / 1
  );

  background:
    radial-gradient(
      150% 75% at 80% 100%,
      var(--lqip-c2),
      rgb(from var(--lqip-c2) r g b / 98%) 10%,
      rgb(from var(--lqip-c2) r g b / 92%) 20%,
      rgb(from var(--lqip-c2) r g b / 82%) 30%,
      rgb(from var(--lqip-c2) r g b / 68%) 40%,
      rgb(from var(--lqip-c2) r g b / 32%) 60%,
      rgb(from var(--lqip-c2) r g b / 18%) 70%,
      rgb(from var(--lqip-c2) r g b / 8%) 80%,
      rgb(from var(--lqip-c2) r g b / 2%) 90%,
      transparent
    ),
    radial-gradient(
      100% 75% at 40% 50%,
      var(--lqip-c1),
      rgb(from var(--lqip-c1) r g b / 98%) 10%,
      rgb(from var(--lqip-c1) r g b / 92%) 20%,
      rgb(from var(--lqip-c1) r g b / 82%) 30%,
      rgb(from var(--lqip-c1) r g b / 68%) 40%,
      rgb(from var(--lqip-c1) r g b / 32%) 60%,
      rgb(from var(--lqip-c1) r g b / 18%) 70%,
      rgb(from var(--lqip-c1) r g b / 8%) 80%,
      rgb(from var(--lqip-c1) r g b / 2%) 90%,
      transparent
    ),
    var(--lqip-c0);
}
</style>
