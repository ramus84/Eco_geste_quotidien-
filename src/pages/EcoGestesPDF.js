import React from 'react';

const gestes = [
  "Éteindre les lumières inutiles",
  "Prendre des douches courtes",
  "Recycler les déchets",
  "Privilégier le vélo ou la marche",
  "Utiliser des sacs réutilisables",
  "Limiter le chauffage",
  "Acheter local et de saison"
];

const EcoGestesPDF = () => {
  const handleDownload = () => {
    const contenu = [
      "Liste des gestes écologiques à respecter au quotidien :",
      "",
      ...gestes.map((g, i) => `${i + 1}. ${g}`)
    ].join('\n');
    const blob = new Blob([contenu], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gestes-ecologiques.pdf';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="page-content">
      <h1>Liste des gestes écologiques</h1>
      <ul>
        {gestes.map((g, i) => <li key={i}>{g}</li>)}
      </ul>
      <button onClick={handleDownload}>Télécharger la liste en PDF</button>
    </div>
  );
};

export default EcoGestesPDF; 