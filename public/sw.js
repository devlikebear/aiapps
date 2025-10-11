// Service Worker placeholder
// This file exists to prevent 404 errors when browsers automatically request /sw.js

self.addEventListener('install', () => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (_event) => {
  // Claim clients immediately
  _event.waitUntil(self.clients.claim());
});

// No-op fetch handler
self.addEventListener('fetch', () => {
  // Pass through - no caching or interception
  return;
});
