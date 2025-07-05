import React, { useEffect } from 'react';

const NotificationPermission = () => {
  // Demander la permission dès que le composant est monté
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          console.log("Permission granted to show notifications.");
        } else {
          console.log("Permission denied.");
        }
      });
    } else {
      console.log("Permission already granted.");
    }
  }, []);

  return (
    <div>
      <h2>Demande de permission pour recevoir des notifications</h2>
      <p>Nous avons besoin de votre autorisation pour vous envoyer des notifications sur les gestes éco-responsables !</p>
    </div>
  );
};

export default NotificationPermission;
