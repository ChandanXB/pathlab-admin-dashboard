export function splitBannerImages(bannerImageString: string | null | undefined): string[] {
  if (!bannerImageString) return [];
  if (!bannerImageString.includes(',')) {
    return [bannerImageString.trim()];
  }
  
  const parts = bannerImageString.split(',');
  const images: string[] = [];
  let currentImage = '';
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (part.startsWith('data:')) {
      if (currentImage) {
        images.push(currentImage);
      }
      currentImage = part;
    } else if (currentImage && currentImage.startsWith('data:') && !currentImage.includes(',base64,')) {
      currentImage = currentImage + ',' + part;
      images.push(currentImage);
      currentImage = '';
    } else {
      if (currentImage) {
        images.push(currentImage);
        currentImage = '';
      }
      images.push(part);
    }
  }
  
  if (currentImage) {
    images.push(currentImage);
  }
  
  return images.filter(Boolean);
}
