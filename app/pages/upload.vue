<script setup lang="ts">
const imageUpload = useImageUpload();

const fileInputRef = useTemplateRef('fileInputRef');

function openFileSelector() {
  fileInputRef.value?.click();
}

const selectedFiles = ref<File[]>([]);
const uploadStatus = ref<{
  isUploading: boolean;
  isSuccess: boolean | null;
  message: string;
  validationErrors: Record<number, string>;
}>({
  isUploading: false,
  isSuccess: null,
  message: '',
  validationErrors: {},
});

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const newFiles = Array.from(input.files);
  selectedFiles.value = [...selectedFiles.value, ...newFiles];

  uploadStatus.value.validationErrors = {};
}

function removeFile(index: number) {
  const file = selectedFiles.value[index];
  if (file) {
    const previewUrl = imageUpload.getFilePreviewUrl(file);
    imageUpload.revokeFilePreviewUrl(previewUrl);
  }

  selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index);

  if (uploadStatus.value.validationErrors[index]) {
    const newErrors = { ...uploadStatus.value.validationErrors };
    uploadStatus.value.validationErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([key]) => Number(key) !== index),
    );
  }
}

async function handleSubmit() {
  if (selectedFiles.value.length === 0) {
    uploadStatus.value = {
      isUploading: false,
      isSuccess: false,
      message: 'Please select at least one image to upload.',
      validationErrors: {},
    };
    return;
  }

  const validationErrors: Record<number, string> = {};
  let hasErrors = false;

  selectedFiles.value.forEach((file, index) => {
    const validation = imageUpload.validateFile(file);
    if (!validation.isValid && validation.error) {
      validationErrors[index] = validation.error;
      hasErrors = true;
    }
  });

  if (hasErrors) {
    uploadStatus.value = {
      isUploading: false,
      isSuccess: false,
      message: 'Some files failed validation. Please check the errors below.',
      validationErrors,
    };
    return;
  }

  uploadStatus.value = {
    isUploading: true,
    isSuccess: null,
    message: 'Uploading images...',
    validationErrors: {},
  };

  try {
    const data = await imageUpload.uploadFiles(selectedFiles.value);

    const failedUploads = data.files.filter((file) => !file.success);
    if (failedUploads.length > 0) {
      const failMessages = failedUploads
        .map((file) => `${file.filename || 'Unknown file'}: ${file.error}`)
        .join(', ');

      uploadStatus.value = {
        isUploading: false,
        isSuccess: false,
        message: `Some files failed to upload: ${failMessages}`,
        validationErrors: {},
      };
    } else {
      uploadStatus.value = {
        isUploading: false,
        isSuccess: true,
        message: data.message || 'Upload successful!',
        validationErrors: {},
      };

      selectedFiles.value.forEach((file) => {
        const previewUrl = imageUpload.getFilePreviewUrl(file);
        imageUpload.revokeFilePreviewUrl(previewUrl);
      });

      selectedFiles.value = [];
    }
  } catch (err) {
    console.error('Upload failed:', err);
    uploadStatus.value = {
      isUploading: false,
      isSuccess: false,
      message: err instanceof Error ? err.message : 'Failed to upload images. Please try again.',
      validationErrors: {},
    };
  }
}

onBeforeUnmount(() => {
  selectedFiles.value.forEach((file) => {
    const previewUrl = imageUpload.getFilePreviewUrl(file);
    imageUpload.revokeFilePreviewUrl(previewUrl);
  });
});
</script>

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
          :accept="imageUpload.allowedFileTypes"
          class="mb-4"
          hidden
          multiple
          @change="handleFileChange"
        />
        <div class="flex space-x-4">
          <AppButton type="button" @click="openFileSelector"> Select Images </AppButton>
          <AppButton type="submit" :disabled="uploadStatus.isUploading || selectedFiles.length < 1">
            {{ uploadStatus.isUploading ? 'Uploading...' : 'Upload' }}
          </AppButton>
        </div>
      </form>

      <div
        v-if="uploadStatus.isSuccess !== null"
        class="mt-4 p-3 rounded"
        :class="{
          'bg-green-100 text-green-800': uploadStatus.isSuccess,
          'bg-red-100 text-red-800': !uploadStatus.isSuccess,
        }"
      >
        {{ uploadStatus.message }}
      </div>

      <div v-if="selectedFiles.length > 0" class="mt-6">
        <h2 class="text-lg font-semibold mb-2">Selected Images ({{ selectedFiles.length }})</h2>
        <ul class="space-y-2">
          <li
            v-for="(file, index) in selectedFiles"
            :key="index"
            class="flex flex-col p-2 bg-gray-50 rounded"
            :class="{ 'border border-red-300': uploadStatus.validationErrors[index] }"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div
                  class="w-10 h-10 bg-gray-200 mr-3 rounded flex items-center justify-center overflow-hidden"
                >
                  <img
                    :src="imageUpload.getFilePreviewUrl(file)"
                    class="object-cover w-full h-full"
                    alt="Preview"
                  />
                </div>
                <span class="text-sm text-gray-700">
                  {{ file.name }} ({{ imageUpload.getHumanFileSize(file.size) }})
                </span>
              </div>
              <button
                type="button"
                class="text-red-500 hover:text-red-700"
                @click="removeFile(index)"
              >
                <span class="sr-only">Remove</span>
                ✕
              </button>
            </div>
            <div v-if="uploadStatus.validationErrors[index]" class="mt-2 text-xs text-red-600">
              {{ uploadStatus.validationErrors[index] }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
