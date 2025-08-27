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
      data: {
        count: number;
        photos: ImageMeta[];
      };
    }>();

    if (data.data?.photos && Array.isArray(data.data.photos)) {
      images.value = data.data.photos;
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

  async function patchImage(id: string, image: Partial<ImageMeta>): Promise<ImageMeta> {
    const response = await fetch(`/api/images/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(image),
    });

    if (!response.ok) {
      throw new Error(`Failed to update image: ${response.status}`);
    }

    const updatedImage = await response.json<ImageMeta>();

    images.value = images.value.map((image) => {
      if (image.id === id) {
        return updatedImage;
      }
      return image;
    });

    return updatedImage;
  }

  return {
    images,

    getImages,
    deleteImage,
    patchImage,
  };
}
