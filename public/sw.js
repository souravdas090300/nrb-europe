const CACHE_NAME = 'nrb-europe-v1'
const RUNTIME_CACHE = 'nrb-europe-runtime'

const PRECACHE_URLS = [
  '/',
  '/offline',
  '/icon-192x192.png',
  '/icon-512x512.png',
]

// Install - cache essential assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        const results = await Promise.allSettled(
          PRECACHE_URLS.map(async (url) => {
            const response = await fetch(url, { cache: 'no-cache' })
            if (!response.ok) {
              throw new Error(`Precache failed for ${url}: ${response.status}`)
            }
            await cache.put(url, response)
          })
        )

        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.warn('[SW] Skipping precache URL:', PRECACHE_URLS[index], result.reason)
          }
        })
      })
      .then(() => self.skipWaiting())
  )
})

// Activate - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map(name => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch - network first, fallback to cache
self.addEventListener('fetch', function(event) {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.open(RUNTIME_CACHE).then(cache => {
      return fetch(event.request)
        .then(response => {
          // Cache successful responses
          if (response.status === 200) {
            cache.put(event.request, response.clone())
          }
          return response
        })
        .catch(() => {
          // Network failed, try cache
          return cache.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Show offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline').then((offlineResponse) => {
                return (
                  offlineResponse ||
                  new Response('Offline', {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                  })
                )
              })
            }

            // For non-navigation requests, return a valid fallback response.
            return new Response(null, { status: 504, statusText: 'Gateway Timeout' })
          })
        })
    })
  )
})

// Push notifications
self.addEventListener('push', function(event) {
  if (!event.data) return
  
  const data = event.data.json()
  
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url,
    },
    actions: [
      {
        action: 'open',
        title: 'Read Now',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    )
  }
})
