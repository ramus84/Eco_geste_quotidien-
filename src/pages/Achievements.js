import React, { useState } from 'react';

// Exemple de structure enrichie (à remplacer par des données réelles plus tard)
const badges = [
  { nom: 'Débutant écolo', icone: '🌱', desc: 'Pour avoir réalisé ton premier geste', unlocked: true, date: '03/07/2025', progress: 1 },
  { nom: 'Ambassadeur', icone: '🤝', desc: 'Pour avoir partagé 10 gestes', unlocked: false, progress: 0.6 },
  { nom: 'Champion du tri', icone: '♻️', desc: 'Pour avoir recyclé 50 objets', unlocked: false, progress: 0.2 },
  { nom: 'Héros du climat', icone: '🌍', desc: 'Pour avoir économisé 100 kg de CO₂', unlocked: true, date: '01/07/2025', progress: 1 },
  { nom: 'Expert zéro déchet', icone: '🚯', desc: 'Pour avoir réduit tes déchets de 50%', unlocked: false, progress: 0.4 },
  { nom: 'Maître de l’eau', icone: '💧', desc: 'Pour avoir économisé 1000 litres d’eau', unlocked: false, progress: 0.1 },
  { nom: 'Pro du vélo', icone: '🚴‍♂️', desc: 'Pour avoir parcouru 100 km à vélo', unlocked: true, date: '15/06/2025', progress: 1 },
  { nom: 'Jardinier engagé', icone: '🌻', desc: 'Pour avoir planté 10 arbres ou plantes', unlocked: false, progress: 0.7 }
];

const Achievements = () => {
  const [clicked, setClicked] = useState(Array(badges.length).fill(false));
  const [confetti, setConfetti] = useState(Array(badges.length).fill(false));

  const handleBadgeClick = idx => {
    if (!badges[idx].unlocked) return;
    const newClicked = [...clicked];
    newClicked[idx] = true;
    setClicked(newClicked);
    // Lance l'animation de confettis
    const newConfetti = [...confetti];
    newConfetti[idx] = true;
    setConfetti(newConfetti);
    setTimeout(() => {
      newClicked[idx] = false;
      setClicked([...newClicked]);
      newConfetti[idx] = false;
      setConfetti([...newConfetti]);
    }, 1200);
  };

  return (
    <div className="page-content">
      <h1>Mes badges</h1>
      <ul className="badges-list">
        {badges.map((b, i) => (
          <li
            key={i}
            className={`badge-card${clicked[i] ? ' badge-clicked' : ''}${!b.unlocked ? ' badge-locked' : ''}`}
            onClick={() => handleBadgeClick(i)}
            tabIndex={0}
            title={b.desc}
          >
            <span className="badge-icone">{b.icone}</span>
            <div className="badge-nom">{b.nom}</div>
            <div className="badge-desc">{b.desc}</div>
            {!b.unlocked && (
              <>
                <div className="badge-lock"><span role="img" aria-label="verrouillé">🔒</span></div>
                <div className="badge-progress-bar">
                  <div className="badge-progress" style={{width: `${Math.round(b.progress*100)}%`}}></div>
                </div>
                <div className="badge-progress-text">{Math.round(b.progress*100)}% débloqué</div>
              </>
            )}
            {b.unlocked && b.date && (
              <div className="badge-date">Débloqué le {b.date}</div>
            )}
            {confetti[i] && (
              <div className="badge-confetti">
                {[...Array(24)].map((_,j)=>(<span key={j} className="confetti" style={{left:`${Math.random()*90+5}%`,animationDelay:`${Math.random()*0.7}s`}}></span>))}
              </div>
            )}
          </li>
        ))}
      </ul>
      <p style={{marginTop: 30}}>Continue à agir pour débloquer de nouveaux badges !</p>
    </div>
  );
};

export default Achievements; 