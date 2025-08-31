<script setup lang="ts"></script>

<template>
  <div>
    <div class="h-dvh w-full">
      <ClientOnly>
        <PhotoMap />
        <template #fallback>
          <div class="w-full h-full flex items-center justify-center bg-gray-100">
            <div class="text-gray-500">Loading map...</div>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped></style>
