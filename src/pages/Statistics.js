import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { FaCalendarAlt, FaRegCalendarAlt, FaUserAlt, FaFilter, FaCheckCircle } from 'react-icons/fa'; // Ajout FaCheckCircle

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

const categories = ['Transport', 'Énergie', 'Déchets', 'Alimentation', 'Eau', 'Autre'];
const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

// Options de base pour tous les graphiques pour un style cohérent
const getCommonChartOptions = (titleText) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: { size: 14 },
        color: '#333',
      },
    },
    title: {
      display: true,
      text: titleText,
      font: { size: 18, weight: 'bold' },
      color: '#0275d8',
      padding: { top: 10, bottom: 20 },
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0,0,0,0.8)',
      titleFont: { size: 16 },
      bodyFont: { size: 14 },
      padding: 10,
      cornerRadius: 4,
    },
  },
  animation: {
    duration: 1200,
    easing: 'easeInOutQuart',
  },
});

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [user, setUser] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [filterTrigger, setFilterTrigger] = useState(0); // Déclencheur pour forcer le rechargement
  const [showToast, setShowToast] = useState(false); // Pour afficher le toast de confirmation
  const [btnValidated, setBtnValidated] = useState(false); // Pour l'animation de validation du bouton

  useEffect(() => {
    axiosInstance.get('/users')
      .then(res => setUsersList(res.data))
      .catch(() => setUsersList([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    if (user) params.user = user;
    axiosInstance.get('/stats/main', { params })
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [year, month, user, filterTrigger]); // Ajout du déclencheur ici

  if (loading) return <div className="text-center p-5">Chargement des statistiques...</div>;
  if (error) return <div className="alert alert-danger">Erreur : {error}</div>;
  if (!stats) return <div className="alert alert-info">Aucune statistique disponible pour les filtres sélectionnés.</div>;

  // --- Configuration des données pour les graphiques ---

  const gestesCategorieData = {
    labels: categories,
    datasets: [{
      label: 'Gestes réalisés',
      data: categories.map(cat => stats.gestesParCategorie[cat] || 0),
      backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#00BCD4', '#8BC34A'],
      borderRadius: 4,
    }]
  };

  const pieData = {
    labels: categories,
    datasets: [{
      data: categories.map(cat => stats.gestesParCategorie[cat] || 0),
      backgroundColor: ['#8BC34A', '#00BCD4', '#FF9800', '#2196F3', '#FFC107', '#4CAF50'],
      borderColor: '#fff',
      borderWidth: 2,
    }]
  };

  const topUsersData = {
    labels: stats.topUsers.map(u => u.username),
    datasets: [{
      label: 'Gestes réalisés',
      data: stats.topUsers.map(u => u.gestesRealises),
      backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#00BCD4'],
      borderRadius: 4,
    }]
  };

  const co2Data = {
    labels: mois,
    datasets: [{
      label: 'CO₂ économisé (kg)',
      data: stats.co2ParMois,
      fill: true,
      backgroundColor: 'rgba(76,175,80,0.2)',
      borderColor: '#4CAF50',
      tension: 0.4,
    }]
  };

  const villes = Object.keys(stats.repartitionVille || {});
  const gestesVilleData = {
    labels: villes,
    datasets: [{
      label: 'Gestes par ville',
      data: villes.map(v => stats.repartitionVille[v].gestes),
      backgroundColor: villes.map((_, i) => `hsl(${i * 60}, 70%, 60%)`),
      borderColor: '#fff',
      borderWidth: 2,
    }]
  };

  const co2VilleData = {
    labels: villes,
    datasets: [{
      label: 'CO₂ économisé par ville (kg)',
      data: villes.map(v => stats.repartitionVille[v].co2),
      backgroundColor: villes.map((_, i) => `hsl(${i * 60 + 30}, 80%, 55%)`),
      borderRadius: 4,
    }]
  };

  // --- Configuration des options pour chaque graphique ---
  
  const pieDoughnutTooltip = {
    callbacks: {
      label: function(context) {
        const label = context.label || '';
        const value = context.raw || 0;
        const total = context.chart.getSortedVisibleDatasetMetas()[0].total;
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
        return `${label}: ${value} (${percentage})`;
      }
    }
  };

  const barOptions = getCommonChartOptions('Gestes réalisés par catégorie');
  const pieOptions = { ...getCommonChartOptions('Répartition des types de gestes'), plugins: { ...getCommonChartOptions().plugins, tooltip: {...getCommonChartOptions().plugins.tooltip, ...pieDoughnutTooltip} }};
  const topUsersOptions = { ...getCommonChartOptions('Top 5 utilisateurs les plus actifs'), indexAxis: 'y' };
  const lineOptions = getCommonChartOptions('Progression des économies de CO₂');
  const doughnutOptions = { ...getCommonChartOptions('Répartition des gestes par ville'), plugins: { ...getCommonChartOptions().plugins, tooltip: {...getCommonChartOptions().plugins.tooltip, ...pieDoughnutTooltip} }};
  const co2VilleOptions = getCommonChartOptions('CO₂ économisé par ville');


  return (
    <div className="page-content" style={{animation: 'fadeIn 1s'}}>
      <h1 className="text-center mb-4">Statistiques ÉcoGestes</h1>
      
      {/* Filtres */}
      <div className="stats-filter-card zoom-in">
        {/* Champ Année avec icône */}
        <div className="stats-filter-field">
          <FaCalendarAlt className="stats-filter-icon" />
          <div className="stats-filter-input-group">
            <label className="form-label">Année</label>
            <input type="number" className="form-control" value={year} onChange={e => setYear(e.target.value)} placeholder="Ex: 2024" />
          </div>
        </div>
        {/* Champ Mois avec icône */}
        <div className="stats-filter-field">
          <FaRegCalendarAlt className="stats-filter-icon" />
          <div className="stats-filter-input-group">
            <label className="form-label">Mois</label>
            <select className="form-select" value={month} onChange={e => setMonth(e.target.value)}>
              <option value="">Tous</option>
              {mois.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
        </div>
        {/* Champ Utilisateur avec icône */}
        <div className="stats-filter-field">
          <FaUserAlt className="stats-filter-icon" />
          <div className="stats-filter-input-group">
            <label className="form-label">Utilisateur</label>
            <select className="form-select" value={user} onChange={e => setUser(e.target.value)}>
              <option value="">Tous</option>
              {usersList.map(u => <option key={u._id} value={u._id}>{u.username} ({u.city || 'N/A'})</option>)}
            </select>
          </div>
        </div>
        {/* Bouton Filtrer */}
        <button
          className={`stats-filter-btn${btnValidated ? ' validated' : ''}`}
          onClick={() => {
            setFilterTrigger(t => t + 1); // Déclenche le filtrage
            setShowToast(true); // Affiche le toast
            setBtnValidated(true); // Active l'animation du bouton
            setTimeout(() => setShowToast(false), 2000); // Cache le toast après 2s
            setTimeout(() => setBtnValidated(false), 900); // Retire l'animation du bouton après 0.9s
          }}
        >
          {btnValidated ? <FaCheckCircle style={{marginRight:8}} /> : <FaFilter style={{marginRight:8}} />}
          {btnValidated ? 'Filtré !' : 'Filtrer'}
        </button>
      </div>
      
      {/* Toast de confirmation filtrage */}
      {showToast && (
        <div className="stats-toast">
          <FaCheckCircle style={{marginRight:8, color:'#43e97b', fontSize:'1.2em'}} />
          Filtrage appliqué !
        </div>
      )}

      {/* Grille pour les graphiques */}
      <div className="row g-4">
        {/* Gestes par Catégorie */}
        <div className="col-lg-6" style={{animation:'fadeInUp 0.7s'}}>
          <div className="p-3 border rounded shadow-sm bg-white">
            <div style={{ position: 'relative', height: '400px' }}>
              <Bar data={gestesCategorieData} options={barOptions} />
            </div>
          </div>
        </div>

        {/* Répartition des gestes */}
        <div className="col-lg-6" style={{animation:'fadeInUp 0.8s'}}>
          <div className="p-3 border rounded shadow-sm bg-white">
            <div style={{ position: 'relative', height: '400px' }}>
              <Pie data={pieData} options={pieOptions}/>
            </div>
          </div>
        </div>
        
        {/* Top Utilisateurs */}
        <div className="col-lg-6" style={{animation:'fadeInUp 0.9s'}}>
          <div className="p-3 border rounded shadow-sm bg-white">
            <div style={{ position: 'relative', height: '400px' }}>
              <Bar data={topUsersData} options={topUsersOptions} />
            </div>
          </div>
        </div>
        
        {/* Progression CO2 */}
        <div className="col-lg-6" style={{animation:'fadeInUp 1s'}}>
          <div className="p-3 border rounded shadow-sm bg-white">
            <div style={{ position: 'relative', height: '400px' }}>
              <Line data={co2Data} options={lineOptions} />
            </div>
          </div>
        </div>

        {/* Gestes par Ville */}
        <div className="col-lg-6" style={{animation:'fadeInUp 1.1s'}}>
          <div className="p-3 border rounded shadow-sm bg-white">
            <div style={{ position: 'relative', height: '400px' }}>
              <Doughnut data={gestesVilleData} options={doughnutOptions} />
            </div>
          </div>
        </div>
        
        {/* CO2 par Ville */}
        <div className="col-lg-6" style={{animation:'fadeInUp 1.2s'}}>
          <div className="p-3 border rounded shadow-sm bg-white">
            <div style={{ position: 'relative', height: '400px' }}>
              <Bar data={co2VilleData} options={co2VilleOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 text-center" style={{animation:'fadeInUp 1.3s'}}>
          <h2 className="text-success">Total CO₂ économisé : <span style={{fontWeight:'bold'}}>{stats.totalCO2.toLocaleString()} kg</span></h2>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(40px);} to { opacity:1; transform:translateY(0);} }
      `}</style>
    </div>
  );
};

export default Statistics; 