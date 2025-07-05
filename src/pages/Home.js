import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../axiosConfig';
import GestureList from '../components/GestureList';
import AddGestureForm from '../components/AddGestureForm';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import Chart from '../components/Chart';
import { FaSearch, FaChartBar } from 'react-icons/fa'; // Ajout des icônes

const Home = () => {
  const [gestures, setGestures] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('dateDesc');
  const [page, setPage] = useState(1);
  const gesturesPerPage = 5;
  const listRef = useRef();

  const fetchGestures = () => {
    axiosInstance.get('/gestures')
      .then(response => setGestures(response.data))
      .catch(error => console.error('Erreur de récupération des gestes:', error));
  };

  useEffect(() => {
    fetchGestures();
  }, []);

  // Extraire les catégories uniques pour le filtre
  const categories = Array.from(new Set(gestures.map(g => g.category).filter(Boolean)));

  // Filtrer les gestes selon la catégorie et la recherche
  let filteredGestures = gestures.filter(g => {
    const matchCategory = categoryFilter ? g.category === categoryFilter : true;
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Trier les gestes
  filteredGestures = filteredGestures.sort((a, b) => {
    if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
    if (sortBy === 'nameDesc') return b.name.localeCompare(a.name);
    if (sortBy === 'dateAsc') return new Date(a.date) - new Date(b.date);
    return new Date(b.date) - new Date(a.date); // dateDesc par défaut
  });

  // Pagination
  const totalPages = Math.ceil(filteredGestures.length / gesturesPerPage);
  const paginatedGestures = filteredGestures.slice((page - 1) * gesturesPerPage, page * gesturesPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  // Statistiques
  const totalCo2 = filteredGestures.reduce((sum, g) => sum + (g.co2Saved || 0), 0);
  const nbGestes = filteredGestures.length;

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Liste des gestes éco-responsables', 10, 10);
    filteredGestures.forEach((g, i) => {
      doc.text(
        `${i + 1}. ${g.name} - ${g.co2Saved || 0} kg CO₂ - ${g.category || ''}`,
        10,
        20 + i * 10
      );
    });
    doc.save('gestes-eco.pdf');
  };

  // Export Excel
  const handleExportExcel = () => {
    const data = filteredGestures.map(g => ({
      Nom: g.name,
      Description: g.description,
      Impact: g.impact,
      'CO2 économisé': g.co2Saved,
      Catégorie: g.category,
      Date: g.date ? new Date(g.date).toLocaleDateString() : '',
      'Image URL': g.imageUrl
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gestes');
    XLSX.writeFile(workbook, 'gestes-eco.xlsx');
  };

  // Impression
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="home-main-container">
      <h1 className="home-title">Bienvenue sur "Mon Éco-Geste Quotidien"</h1>
      <div className="home-chart-container">
        <Chart gestures={filteredGestures} />
      </div>
      <div className="home-actions">
        {/* Bouton Découvrir les gestes avec icône */}
        <button className="home-btn home-btn-gestes" onClick={() => window.location.href='/gestes-maison'}>
          <FaSearch className="home-btn-icon" /> Découvrir les gestes
        </button>
        {/* Bouton Voir les statistiques avec icône */}
        <button className="home-btn home-btn-stats" onClick={() => window.location.href='/statistics'}>
          <FaChartBar className="home-btn-icon" /> Voir les statistiques
        </button>
      </div>
    </div>
  );
};

export default Home;
