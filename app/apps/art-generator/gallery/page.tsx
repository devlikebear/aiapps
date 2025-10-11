import { redirect } from 'next/navigation';

export default function ArtGalleryPage() {
  // Redirect to unified library with image tab
  redirect('/library?tab=image');
}
