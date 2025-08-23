<template>
  <div
    class="flex flex-col p-2 bg-gray-50 rounded"
    :class="{
      'border border-red-300': Boolean(error) || status === 'error',
      'border border-green-300': status === 'success',
      'border border-blue-300': status === 'uploading',
    }"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <div
          class="w-10 h-10 bg-gray-200 mr-3 rounded flex items-center justify-center overflow-hidden"
        >
          <img :src="getFilePreviewUrl(file)" class="object-cover w-full h-full" alt="Preview" />
        </div>
        <div class="flex flex-col">
          <span class="text-sm text-gray-700">
            {{ file.name }} ({{ getHumanFileSize(file.size) }})
          </span>
          <span
            v-if="status && status !== 'pending'"
            class="text-xs"
            :class="{
              'text-blue-600': status === 'uploading',
              'text-green-600': status === 'success',
              'text-red-600': status === 'error',
            }"
          >
            {{ getStatusText(status) }}
          </span>
        </div>
      </div>
      <AppButton
        variant="danger"
        size="small"
        :disabled="status === 'uploading'"
        @click="emit('removeFile')"
      >
        <span class="sr-only">Remove</span>
        ✕
      </AppButton>
    </div>
    <div v-if="error" class="mt-2 text-xs text-red-600">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  file,
  error = '',
  status = 'pending',
} = defineProps<{
  file: File;
  error?: string;
  status?: 'pending' | 'uploading' | 'success' | 'error';
}>();

const emit = defineEmits<{
  removeFile: [];
}>();

const { getFilePreviewUrl, getHumanFileSize } = useImageUpload();

function getStatusText(status: string): string {
  switch (status) {
    case 'uploading':
      return 'Uploading...';
    case 'success':
      return 'Upload successful';
    case 'error':
      return 'Upload failed';
    default:
      return '';
  }
}
</script>
