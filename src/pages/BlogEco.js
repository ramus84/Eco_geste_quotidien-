import React, { useState } from 'react';

const articles = [
  {
    titre: "5 astuces pour réduire son empreinte carbone",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    texte: "Découvrez comment adopter des gestes simples au quotidien pour limiter votre impact sur l'environnement : privilégier le vélo, consommer local, réduire le plastique, économiser l'énergie et recycler."
  },
  {
    titre: "Pourquoi composter ?",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
    texte: "Le compostage permet de réduire la quantité de déchets et de nourrir la terre de votre jardin. C'est un geste facile à mettre en place, même en ville !"
  },
  {
    titre: "Événements à venir",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    texte: "Participez à nos ateliers et rencontres pour échanger sur les éco-gestes et découvrir de nouvelles initiatives près de chez vous."
  },
  {
    titre: "L'eau, une ressource précieuse",
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=600&q=80",
    texte: "Adoptez des gestes simples pour économiser l'eau : fermer le robinet, récupérer l'eau de pluie, privilégier les douches courtes."
  }
];

const BlogEco = () => {
  // État pour savoir quel article est ouvert (null = aucun)
  const [articleOuvert, setArticleOuvert] = useState(null);

  // Fonction pour ouvrir un article
  const ouvrirArticle = (index) => {
    setArticleOuvert(index);
    // On peut aussi faire défiler jusqu'à l'article ouvert si besoin
    setTimeout(() => {
      const el = document.getElementById('article-ouvert');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Fonction pour fermer l'article
  const fermerArticle = () => setArticleOuvert(null);

  return (
    <div className="page-content">
      <h1>Blog Éco</h1>
      {/* Si aucun article n'est ouvert, on affiche la liste */}
      {articleOuvert === null ? (
        <div className="articles-list" style={{display:'flex',flexWrap:'wrap',gap:24,justifyContent:'center'}}>
          {articles.map((art, i) => (
            <article
              key={i}
              className="article-card"
              style={{
                marginBottom: '2rem',
                background: '#f6f6f6',
                borderRadius: 10,
                padding: 20,
                boxShadow: '0 2px 8px #0001',
                width: 320,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                transform: 'scale(1)',
                position: 'relative',
                overflow: 'hidden',
                border: '2px solid transparent',
              }}
              onClick={() => ouvrirArticle(i)}
              tabIndex={0}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && ouvrirArticle(i)}
            >
              <img src={art.image} alt={art.titre} style={{width: '100%', maxWidth: 400, borderRadius: 8, marginBottom: 10, height: 160, objectFit: 'cover'}} />
              <h2 style={{fontSize:'1.2em',margin:'0 0 8px 0'}}>{art.titre}</h2>
              <p style={{color:'#555',fontSize:'1em',margin:0}}>{art.texte.slice(0, 90)}...</p>
              <span style={{position:'absolute',bottom:12,right:16,color:'#43c59e',fontWeight:600,fontSize:'0.95em'}}>Lire l'article</span>
            </article>
          ))}
        </div>
      ) : (
        // Si un article est ouvert, on l'affiche en grand
        <div
          id="article-ouvert"
          className="article-detail"
          style={{
            maxWidth: 600,
            margin: '32px auto',
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 6px 32px #0002',
            padding: 32,
            position: 'relative',
            animation: 'fadeInUp 0.5s',
          }}
        >
          {/* Bouton fermer (croix) */}
          <button
            onClick={fermerArticle}
            aria-label="Fermer l'article"
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: 'none',
              border: 'none',
              fontSize: 28,
              color: '#43c59e',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'color 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.color = '#2d8a8a'}
            onMouseOut={e => e.currentTarget.style.color = '#43c59e'}
          >
            ×
          </button>
          <img src={articles[articleOuvert].image} alt={articles[articleOuvert].titre} style={{width: '100%', borderRadius: 12, marginBottom: 18, maxHeight: 260, objectFit: 'cover'}} />
          <h2 style={{fontSize:'1.5em',margin:'0 0 16px 0'}}>{articles[articleOuvert].titre}</h2>
          <p style={{color:'#333',fontSize:'1.1em',lineHeight:1.7}}>{articles[articleOuvert].texte}</p>
        </div>
      )}
    </div>
  );
};

export default BlogEco; 