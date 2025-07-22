export function useImages() {
  async function getImages(): Promise<unknown> {
    const response = await fetch('/api/images', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to get images: ${response.status}`);
    }

    const data = await response.json();

    return data;
  }

  return {
    getImages,
  };
}
