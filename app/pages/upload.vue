<script setup lang="ts">

const { handleFileChange, handleSubmit, selectedFiles } = useUploadForm();

function useUploadForm() {
  const selectedFiles = ref<File[]>([]);

  async function handleSubmit() {
    console.log("Form submitted");
  }
  
  async function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      selectedFiles.value.push(...Array.from(input.files));
    }
  }

  return { handleFileChange, handleSubmit, selectedFiles };
}
</script>

<template>
  <div>
    <div class="max-w-md mx-auto p-4 flex flex-col">
      <h1 class="text-2xl font-bold mb-4">Upload Image</h1>
      <form @submit.prevent="handleSubmit">
        <input id="image-upload" name="image-upload" type="file" accept="image/png, image/jpeg" class="mb-4" hidden @change="handleFileChange">
        <label for="image-upload" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 hover:cursor-pointer">
          Select Image
        </label>
      </form>

      <div class="mt-4">
        <ul>
          <li v-for="file in selectedFiles" :key="file.name" class="text-sm text-gray-700">{{ file.name }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>