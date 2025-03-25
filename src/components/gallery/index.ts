// Export all gallery components for easier imports

// Core components
export { MediaCard } from './MediaCard';
export type { MediaItem, Comment } from './MediaCard';
export { MasonryGrid } from './MasonryGrid';
export { MediaViewer } from './MediaViewer';

// For backward compatibility (if MediaGrid is needed)
import { MasonryGrid as MediaGrid } from './MasonryGrid';
export { MediaGrid };

// Layout components
export { GalleryLayout } from './GalleryLayout';
export { GallerySidebar } from './GallerySidebar';
export { GalleryHeader } from './GalleryHeader';

// Additional components (if they exist)
export { MediaUpload } from './MediaUpload';
export { MediaModeration } from './MediaModeration';
export { MediaLightbox } from './MediaLightbox';

// Utilities and sub-components
export * from './gallery-tabs';
export * from './gallery-grid';
export * from './optimized-image';
export * from './photo-lightbox';
export * from './upload-dropzone';
export * from './upload-with-tags'; 