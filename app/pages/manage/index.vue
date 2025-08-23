<template>
  <div>
    <div class="max-w-md mx-auto p-4 flex flex-col">
      <h1 class="text-2xl font-bold mb-4">Upload Images</h1>
      <form @submit.prevent="handleSubmit">
        <input
          id="image-upload"
          ref="fileInputRef"
          name="image-upload"
          type="file"
          class="mb-4"
          hidden
          multiple
          @change="handleFileChange"
        />
        <div class="flex space-x-4">
          <AppButton type="button" @click="openFileSelector"> Select Images </AppButton>
          <AppButton type="submit" :disabled="isUploading || selectedFiles.length < 1">
            {{ isUploading ? 'Uploading...' : 'Upload' }}
          </AppButton>
        </div>
      </form>

      <div
        v-if="uploadMessage"
        class="mt-4 p-3 rounded"
        :class="{
          'bg-green-100 text-green-800': uploadMessage.type === 'success',
          'bg-red-100 text-red-800': uploadMessage.type === 'error',
          'bg-blue-100 text-blue-800': uploadMessage.type === 'info',
        }"
      >
        {{ uploadMessage.text }}
      </div>

      <div v-if="selectedFiles.length > 0" class="mt-6">
        <h2 class="text-lg font-semibold mb-2">Selected Images ({{ selectedFiles.length }})</h2>
        <div class="space-y-2">
          <UploadPhotoCard
            v-for="(fileStatus, index) in fileUploadStatuses"
            :key="index"
            :file="fileStatus.file"
            :status="fileStatus.status"
            :error="
              fileStatus.error ||
              (fileStatus.result && !fileStatus.result.success
                ? fileStatus.result.file.success === false
                  ? fileStatus.result.file.error
                  : 'Upload failed'
                : undefined)
            "
            @removeFile="removeFile(index)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FileUploadStatus } from '~/composables/useImageUpload';

const imageUpload = useImageUpload();
const fileInputRef = useTemplateRef('fileInputRef');

function openFileSelector() {
  fileInputRef.value?.click();
}

const selectedFiles = ref<File[]>([]);
const fileUploadStatuses = ref<FileUploadStatus[]>([]);
const isUploading = ref(false);

const uploadMessage = ref<{
  type: 'success' | 'error' | 'info';
  text: string;
} | null>(null);

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const newFiles = Array.from(input.files);
  selectedFiles.value = [...selectedFiles.value, ...newFiles];

  // Initialize upload statuses for new files
  const newStatuses: FileUploadStatus[] = newFiles.map((file) => ({
    file,
    status: 'pending',
  }));

  fileUploadStatuses.value = [...fileUploadStatuses.value, ...newStatuses];
  uploadMessage.value = null;
}

function removeFile(index: number) {
  const file = selectedFiles.value[index];
  if (file) {
    const previewUrl = imageUpload.getFilePreviewUrl(file);
    imageUpload.revokeFilePreviewUrl(previewUrl);
  }

  selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index);
  fileUploadStatuses.value = fileUploadStatuses.value.filter((_, i) => i !== index);
}

async function handleSubmit() {
  if (selectedFiles.value.length === 0) {
    uploadMessage.value = {
      type: 'error',
      text: 'Please select at least one image to upload.',
    };
    return;
  }

  // Validate all files first
  const validationErrors: string[] = [];
  selectedFiles.value.forEach((file, _index) => {
    const validation = imageUpload.validateFile(file);
    if (!validation.isValid && validation.error) {
      validationErrors.push(`${file.name}: ${validation.error}`);
    }
  });

  if (validationErrors.length > 0) {
    uploadMessage.value = {
      type: 'error',
      text: `Validation failed: ${validationErrors.join(', ')}`,
    };
    return;
  }

  isUploading.value = true;
  uploadMessage.value = {
    type: 'info',
    text: 'Uploading images...',
  };

  try {
    const finalStatuses = await imageUpload.uploadFiles(selectedFiles.value, (statuses) => {
      fileUploadStatuses.value = statuses;
    });

    // Update final statuses
    fileUploadStatuses.value = finalStatuses;

    // Analyze results
    const successCount = finalStatuses.filter((status) => status.status === 'success').length;
    const errorCount = finalStatuses.filter((status) => status.status === 'error').length;

    if (errorCount === 0) {
      uploadMessage.value = {
        type: 'success',
        text: `All ${successCount} images uploaded successfully!`,
      };

      // Clean up successful uploads
      selectedFiles.value.forEach((file) => {
        const previewUrl = imageUpload.getFilePreviewUrl(file);
        imageUpload.revokeFilePreviewUrl(previewUrl);
      });

      selectedFiles.value = [];
      fileUploadStatuses.value = [];
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
    } else if (successCount === 0) {
      uploadMessage.value = {
        type: 'error',
        text: `All ${errorCount} images failed to upload. Check individual errors below.`,
      };
    } else {
      uploadMessage.value = {
        type: 'error',
        text: `${successCount} images uploaded successfully, but ${errorCount} failed. Check errors below.`,
      };

      // Remove successful uploads from the list
      const failedIndices = finalStatuses
        .map((status, index) => (status.status === 'error' ? index : -1))
        .filter((index) => index !== -1);

      selectedFiles.value = failedIndices
        .map((index) => selectedFiles.value[index])
        .filter((file): file is File => Boolean(file));
      fileUploadStatuses.value = failedIndices
        .map((index) => finalStatuses[index])
        .filter((status): status is FileUploadStatus => Boolean(status));

      // Clean up successful uploads
      finalStatuses.forEach((status, _index) => {
        if (status.status === 'success' && !failedIndices.includes(_index)) {
          const previewUrl = imageUpload.getFilePreviewUrl(status.file);
          imageUpload.revokeFilePreviewUrl(previewUrl);
        }
      });
    }
  } catch (error) {
    console.error('Upload failed:', error);
    uploadMessage.value = {
      type: 'error',
      text: error instanceof Error ? error.message : 'Failed to upload images. Please try again.',
    };
  } finally {
    isUploading.value = false;
  }
}

onBeforeUnmount(() => {
  selectedFiles.value.forEach((file) => {
    const previewUrl = imageUpload.getFilePreviewUrl(file);
    imageUpload.revokeFilePreviewUrl(previewUrl);
  });
});
</script>
