<template>
  <NuxtImg
    v-if="useCloudflareTransforms"
    v-slot="{ src, isLoaded }"
    provider="cloudflare"
    :modifiers="computedModifiers"
    :src="image.url"
    :alt="image.originalFilename || image.filename"
    :width="width"
    :height="height"
    :sizes="sizes"
  >
    <img
      v-if="isLoaded"
      :src="src"
      :alt="image.originalFilename || image.filename"
      v-bind="$attrs"
    />
    <div
      v-else
      :style="{
        '--lqip': image.lqip,
      }"
    />
  </NuxtImg>

  <!-- Fallback for local development -->
  <img v-else :src="image.url" :alt="image.originalFilename || image.filename" v-bind="$attrs" />
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
  sizes?: string;
  quality?: number;
  fit?: 'contain' | 'cover' | 'crop' | 'scale-down';
}

const {
  image,
  width = undefined,
  height = undefined,
  maxWidth = undefined,
  maxHeight = undefined,
  sizes = undefined,
  quality = 80,
  fit = 'contain',
} = defineProps<Props>();

const useCloudflareTransforms = computed<boolean | undefined>(() => {
  return !import.meta.dev && image.url?.includes('images.kazusan.me');
});

const computedModifiers = computed(() => ({
  fit,
  quality,
  ...(width && { width }),
  ...(height && { height }),
  ...(maxWidth && { w: maxWidth }),
  ...(maxHeight && { h: maxHeight }),
}));
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
