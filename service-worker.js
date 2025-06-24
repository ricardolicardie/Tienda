// Service Worker for push notifications
self.addEventListener("install", (event) => {
  console.log("Service Worker installed")
})

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated")
})

self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || "/favicon.ico",
      badge: "/favicon.ico",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
      actions: [
        {
          action: "explore",
          title: "Ver detalles",
          icon: "/images/checkmark.png",
        },
        {
          action: "close",
          title: "Cerrar",
          icon: "/images/xmark.png",
        },
      ],
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/panel"))
  }
})
