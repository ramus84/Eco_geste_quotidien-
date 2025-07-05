import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import EditGestureForm from './EditGestureForm';

// Composant pour afficher la liste des gestes avec recherche, tri, filtrage, pagination, suppression et édition
function GestureList() {
  // État pour stocker la liste des gestes
  const [gestures, setGestures] = useState([]);
  // État pour afficher un message
  const [message, setMessage] = useState('');
  // État pour savoir quel geste est en cours d'édition
  const [editingGesture, setEditingGesture] = useState(null);
  // Recherche et filtrage
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  // Tri
  const [sortBy, setSortBy] = useState('name');
  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Fonction pour charger la liste des gestes
  const fetchGestures = () => {
    axiosInstance.get('/gestures')
      .then(res => setGestures(res.data));
  };

  // useEffect pour charger la liste au chargement du composant
  useEffect(() => {
    fetchGestures();
  }, []);

  // Fonction pour supprimer un geste
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce geste ?')) return;
    try {
      await axiosInstance.delete(`/gestures/${id}`);
      setMessage('Geste supprimé !');
      fetchGestures(); // Actualise la liste
    } catch (err) {
      setMessage('Erreur lors de la suppression.');
    }
  };

  // Fonction appelée après édition pour rafraîchir la liste et fermer le formulaire
  const handleEditSaved = () => {
    setEditingGesture(null);
    fetchGestures();
  };

  // Recherche et filtrage par catégorie
  const filteredGestures = gestures.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterCat === '' || g.category === filterCat)
  );

  // Tri
  const sortedGestures = [...filteredGestures].sort((a, b) => {
    if (sortBy === 'co2Saved') return b.co2Saved - a.co2Saved;
    return a[sortBy].localeCompare(b[sortBy]);
  });

  // Pagination
  const totalPages = Math.ceil(sortedGestures.length / itemsPerPage);
  const paginatedGestures = sortedGestures.slice((page-1)*itemsPerPage, page*itemsPerPage);

  // Remettre à la première page si la recherche ou le filtre change
  useEffect(() => { setPage(1); }, [search, filterCat, sortBy]);

  return (
    <div style={{margin:'20px',padding:'20px',background:'#e3f2fd',borderRadius:10,maxWidth:700}}>
      <h3>Liste des gestes enregistrés</h3>
      {/* Barre de recherche et filtres */}
      <div style={{marginBottom:12}}>
        <input
          type="text"
          placeholder="Rechercher un geste"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{marginRight:10, width:'40%'}}
        />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{marginRight:10}}>
          <option value="">Toutes catégories</option>
          <option value="Énergie">Énergie</option>
          <option value="Alimentation">Alimentation</option>
          <option value="Déchets">Déchets</option>
          <option value="Transport">Transport</option>
          <option value="Eau">Eau</option>
          <option value="Autre">Autre</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Nom</option>
          <option value="category">Catégorie</option>
          <option value="co2Saved">CO₂ économisé</option>
        </select>
      </div>
      <ul>
        {paginatedGestures.map(g => (
          <li key={g._id} style={{marginBottom:10}}>
            {editingGesture && editingGesture._id === g._id ? (
              // Formulaire d'édition pour ce geste
              <EditGestureForm gesture={g} onCancel={() => setEditingGesture(null)} onSaved={handleEditSaved} />
            ) : (
              <>
                <strong>{g.name}</strong> - {g.description} <em>({g.category})</em> : {g.co2Saved} kg CO₂
                {/* Bouton pour modifier le geste */}
                <button onClick={() => setEditingGesture(g)} style={{marginLeft:10,background:'#ffa726',color:'#fff',border:'none',borderRadius:4,padding:'2px 8px',cursor:'pointer'}}>Modifier</button>
                {/* Bouton pour supprimer le geste */}
                <button onClick={() => handleDelete(g._id)} style={{marginLeft:10,background:'#e53935',color:'#fff',border:'none',borderRadius:4,padding:'2px 8px',cursor:'pointer'}}>Supprimer</button>
              </>
            )}
          </li>
        ))}
      </ul>
      {/* Pagination */}
      <div style={{marginTop:10}}>
        Page {page} / {totalPages || 1}
        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} style={{marginLeft:10}}>Précédent</button>
        <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages || totalPages === 0} style={{marginLeft:5}}>Suivant</button>
      </div>
      <div style={{marginTop:10}}>{message}</div>
    </div>
  );
}

export default GestureList;
