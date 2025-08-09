import type { ImageMeta } from '~/types/image';

export function useImages() {
  async function getImages(): Promise<ImageMeta[]> {
    const response = await fetch('/api/images', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to get images: ${response.status}`);
    }

    const data = await response.json<{
      success: boolean;
      count: number;
      photos: ImageMeta[];
    }>();

    if (data.photos && Array.isArray(data.photos)) {
      return data.photos;
    }

    return [];
  }

  async function deleteImage(id: string): Promise<void> {
    const response = await fetch(`/api/images/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete image: ${response.status}`);
    }
  }

  return {
    getImages,
    deleteImage,
  };
}
