export function getImageUrl(src: string): string {
  if (!src) {
    return '/placeholder.svg';
  }
  
  if (src.startsWith('https://res.cloudinary.com')) {
    return src;
  }
  
  return src.replace('/public/', '/');
}
