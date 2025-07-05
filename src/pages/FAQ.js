import React from 'react';

const FAQ = () => (
  <div className="container py-4">
    <h2>FAQ</h2>
    <div className="mb-3">
      <strong>Comment ajouter un geste ?</strong>
      <p>Utilise le formulaire sur la page d’accueil ou le bouton “+ Ajouter un geste” dans la barre de navigation.</p>
    </div>
    <div className="mb-3">
      <strong>Comment voir mes statistiques ?</strong>
      <p>Les statistiques sont affichées sur la page d’accueil et dans le tableau de bord.</p>
    </div>
    <div className="mb-3">
      <strong>Mes données sont-elles sauvegardées ?</strong>
      <p>Oui, tous les gestes ajoutés sont stockés dans la base de données MongoDB.</p>
    </div>
    <div className="mb-3">
      <strong>Puis-je exporter mes données ?</strong>
      <p>Oui, tu peux exporter la liste des gestes en PDF ou Excel depuis la page d’accueil.</p>
    </div>
  </div>
);

export default FAQ; 