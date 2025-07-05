this.addEventListener('push', function(event) {
  const options = {
    body: event.data.text(),
    icon: '/icon.png',  // Icône à afficher dans la notification
    badge: '/badge.png' // Badge pour l'icône
  };

  event.waitUntil(
    this.registration.showNotification('Mon Éco-Geste Quotidien', options)
  );
});
