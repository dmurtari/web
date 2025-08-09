<template>
  <div class="flex min-h-screen flex-col">
    <AppTopNav v-if="isAuthenticated" />
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated } = usePermissions();
</script>
