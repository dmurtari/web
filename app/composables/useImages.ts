import type { ImageMeta } from '~/types/image';

export function useImages() {
  const images = useState<ImageMeta[]>('images', () => []);

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
      images.value = data.photos;
    } else {
      images.value = [];
    }

    return images.value;
  }

  async function deleteImage(id: string): Promise<void> {
    const response = await fetch(`/api/images/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete image: ${response.status}`);
    }

    images.value = images.value.filter((image) => image.id !== id);
  }

  return {
    images,

    getImages,
    deleteImage,
  };
}
