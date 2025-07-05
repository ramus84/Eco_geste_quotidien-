import React, { useState } from 'react';

const contenus = [
  {
    titre: "🌱 Bienvenue dans la communauté ÉcoGestes",
    contenu: (
      <p>
        Rejoins une communauté dynamique de plus de <b>10 000 utilisateurs</b> engagés pour la planète !<br />
        Ensemble, nous partageons des gestes simples et efficaces pour réduire notre impact environnemental au quotidien.
      </p>
    )
  },
  {
    titre: "♻️ 50 000 gestes éco-responsables réalisés",
    contenu: (
      <ul>
        <li>Éteindre les lumières en quittant une pièce</li>
        <li>Réduire la consommation d'eau lors de la douche</li>
        <li>Recycler et trier les déchets à la maison</li>
        <li>Privilégier les transports en commun ou le vélo</li>
        <li>Utiliser des sacs réutilisables pour les courses</li>
        <li>Et bien d'autres actions partagées par la communauté !</li>
      </ul>
    )
  },
  {
    titre: "🎯 Objectif 2030 : 100 000 gestes pour la planète",
    contenu: (
      <p>
        Notre ambition : <b>atteindre 100 000 gestes éco-responsables</b> avant 2030 !<br />
        Chaque geste compte, et chaque utilisateur contribue à un avenir plus vert.<br />
        Merci pour ton engagement et ta participation active !
      </p>
    )
  },
  {
    titre: "👋 Bienvenue Gobel dans ÉcoGestes !",
    contenu: (
      <p>
        Bonjour <b>Gobel</b> !<br />
        Merci de rejoindre la communauté ÉcoGestes.<br />
        Ensemble, nous pouvons faire la différence pour la planète, un petit geste à la fois.
      </p>
    )
  },
  {
    titre: "🌍 Gestes éco-responsables pour ta région",
    contenu: (
      <ul>
        <li>Éteindre les appareils électriques en veille</li>
        <li>Utiliser l'eau de pluie pour arroser le jardin</li>
        <li>Privilégier les produits locaux et de saison</li>
        <li>Participer au recyclage des déchets plastiques</li>
        <li>Planter des arbres ou des plantes locales</li>
        <li>Favoriser le covoiturage ou les transports en commun</li>
        <li>Éviter le gaspillage alimentaire</li>
      </ul>
    )
  },
  {
    titre: "🚀 Objectif : une région plus verte grâce à toi !",
    contenu: (
      <p>
        Chaque geste compte, Gobel !<br />
        Ensemble, visons <b>100 000 gestes éco-responsables</b> dans ta région avant 2030.<br />
        Merci pour ton engagement et ta motivation à inspirer les autres autour de toi !
      </p>
    )
  }
];

const Carousel = () => {
  const [index, setIndex] = useState(0);

  const allerPrecedent = () => {
    if (index > 0) setIndex(index - 1);
  };

  const allerSuivant = () => {
    if (index < contenus.length - 1) setIndex(index + 1);
  };

  return (
    <div style={{ textAlign: 'center', margin: '2rem auto', maxWidth: 400 }}>
      <h2>{contenus[index].titre}</h2>
      <div style={{ margin: '1rem 0' }}>
        {contenus[index].contenu}
      </div>
      <button
        onClick={allerPrecedent}
        disabled={index === 0}
        style={{
          marginRight: 10,
          padding: '8px 16px',
          borderRadius: 6,
          border: 'none',
          background: index === 0 ? '#ccc' : '#4CAF50',
          color: 'white',
          cursor: index === 0 ? 'not-allowed' : 'pointer'
        }}
      >
        Précédent
      </button>
      <button
        onClick={allerSuivant}
        disabled={index === contenus.length - 1}
        style={{
          padding: '8px 16px',
          borderRadius: 6,
          border: 'none',
          background: index === contenus.length - 1 ? '#ccc' : '#4CAF50',
          color: 'white',
          cursor: index === contenus.length - 1 ? 'not-allowed' : 'pointer'
        }}
      >
        Suivant
      </button>
    </div>
  );
};

export default Carousel; 