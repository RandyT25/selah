const CACHE_NAME = "selah-v2";
const BIBLE_CACHE = "selah-bible-v2";
const STATIC_CACHE = "selah-static-v2";

const STATIC_ASSETS = [
  "/",
  "/bibleapp/dashboard",
  "/bibleapp/bible",
  "/bibleapp/journal",
  "/bibleapp/plans",
  "/bibleapp/devotionals",
  "/manifest.json",
];

const BIBLE_URLS = /\/bibleapp\/bible\//;

// Install - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS.map((url) => new Request(url, { credentials: "include" })));
    }).catch(() => {
      // Silently fail on install
    })
  );
  self.skipWaiting();
});

// Activate - clean up ALL old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== BIBLE_CACHE && name !== STATIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first with cache fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-http(s) requests (e.g. chrome-extension://)
  if (!request.url.startsWith("http")) return;
  // Skip non-GET requests and API calls (except bible verses)
  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/bible/")) return;

  // Bible verse caching strategy - cache first for offline reading
  if (BIBLE_URLS.test(url.pathname) || url.pathname.startsWith("/api/bible/")) {
    event.respondWith(
      caches.open(BIBLE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          return cached ?? new Response("Offline", { status: 503 });
        }
      })
    );
    return;
  }

  // Network first for HTML pages
  if (request.headers.get("Accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request) || await caches.match("/bibleapp/dashboard");
        return cached || new Response("You are offline", { status: 503, headers: { "Content-Type": "text/html" } });
      })
    );
    return;
  }

  // Stale while revalidate for static assets
  event.respondWith(
    caches.open(STATIC_CACHE).then(async (cache) => {
      const cached = await cache.match(request);

      const networkPromise = fetch(request).then((response) => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      }).catch(() => cached ?? new Response("Offline", { status: 503 }));

      return cached ?? networkPromise;
    })
  );
});

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Selah", {
      body: data.body ?? "Time for your daily Scripture reading.",
      icon: "/icons/notification-icon.png",
      badge: "/icons/badge-96x96.png",
      data: { url: data.url ?? "/bibleapp/dashboard" },
      actions: [
        { action: "open", title: "Open Selah" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  );
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const url = event.notification.data?.url ?? "/bibleapp/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      clients.openWindow(url);
    })
  );
});
