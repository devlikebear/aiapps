// Service Worker placeholder
// This file exists to prevent 404 errors when browsers automatically request /sw.js

self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim clients immediately
  event.waitUntil(self.clients.claim());
});

// No-op fetch handler
self.addEventListener('fetch', (event) => {
  // Pass through - no caching or interception
  return;
});
