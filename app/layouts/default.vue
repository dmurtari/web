<template>
  <div class="flex h-screen flex-col">
    <AppTopNav v-if="isAuthenticated" />
    <main class="flex-1 overflow-hidden">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated } = usePermissions();
</script>
