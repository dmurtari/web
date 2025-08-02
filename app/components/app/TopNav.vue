<template>
  <nav class="flex items-center justify-between p-4 bg-gray-800 text-white">
    <div class="text-lg font-bold">Kazusan Web</div>
    <div class="flex space-x-4">
      <NuxtLink to="/" class="hover:underline">Home</NuxtLink>
      <NuxtLink to="/manage/upload" class="hover:underline">Upload</NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts"></script>
