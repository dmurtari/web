<script setup lang="ts">
const { file, error = '' } = defineProps<{
  file: File;
  error?: string;
}>();

const emit = defineEmits<{
  removeFile: [];
}>();

const { getFilePreviewUrl, getHumanFileSize } = useImageUpload();
</script>

<template>
  <div
    class="flex flex-col p-2 bg-gray-50 rounded"
    :class="{ 'border border-red-300': Boolean(error) }"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <div
          class="w-10 h-10 bg-gray-200 mr-3 rounded flex items-center justify-center overflow-hidden"
        >
          <img :src="getFilePreviewUrl(file)" class="object-cover w-full h-full" alt="Preview" />
        </div>
        <span class="text-sm text-gray-700">
          {{ file.name }} ({{ getHumanFileSize(file.size) }})
        </span>
      </div>
      <button type="button" class="text-red-500 hover:text-red-700" @click="emit('removeFile')">
        <span class="sr-only">Remove</span>
        ✕
      </button>
    </div>
    <div v-if="error" class="mt-2 text-xs text-red-600">
      {{ error }}
    </div>
  </div>
</template>
