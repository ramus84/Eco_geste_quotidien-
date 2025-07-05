import React, { useState, useRef, useEffect } from 'react';
import { Button, Dropdown, Alert, Spinner } from 'react-bootstrap';
import { FaFilePdf, FaFileExcel, FaFileCsv, FaPrint, FaShareAlt, FaDownload, FaCog } from 'react-icons/fa';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Composant pour exporter les gestes en PDF et Excel
 * Permet aux utilisateurs de télécharger leurs données
 */
const ExportTools = ({ gestures, filters = {} }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // État pour gérer l'ouverture du menu Plus d'options
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  // Référence pour détecter les clics en dehors du menu
  const optionsRef = useRef(null);
  // État pour le titre personnalisé et les colonnes à exporter
  const [customTitle, setCustomTitle] = useState('Mes gestes éco-responsables');
  const [selectedColumns, setSelectedColumns] = useState({
    name: true,
    category: true,
    description: true,
    co2Saved: true,
    date: true
  });
  // Filtres pour l'export (catégorie, date)
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Liste des colonnes disponibles (pour affichage)
  const columnsList = [
    { key: 'name', label: 'Nom' },
    { key: 'category', label: 'Catégorie' },
    { key: 'description', label: 'Description' },
    { key: 'co2Saved', label: 'CO2 économisé (kg)' },
    { key: 'date', label: 'Date' }
  ];

  // Liste des catégories disponibles
  const categories = Array.from(new Set(gestures.map(g => g.category).filter(Boolean)));

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setIsOptionsOpen(false);
      }
    }
    if (isOptionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOptionsOpen]);

  // Fonction utilitaire pour filtrer les gestes selon les filtres et colonnes sélectionnées
  const getFilteredGestures = () => {
    // Vérification : gestures est-il bien un tableau ?
    if (!Array.isArray(gestures)) return [];
    return gestures
      .filter(g => !filterCategory || g.category === filterCategory)
      .filter(g => {
        if (!filterDateFrom && !filterDateTo) return true;
        const d = g.date ? new Date(g.date) : null;
        if (!d) return false;
        if (filterDateFrom && d < new Date(filterDateFrom)) return false;
        if (filterDateTo && d > new Date(filterDateTo)) return false;
        return true;
      })
      .map(g => {
        const filtered = {};
        Object.keys(selectedColumns).forEach(col => {
          if (selectedColumns[col]) filtered[col] = g[col] || '';
        });
        return filtered;
      });
  };

  // Fonction pour exporter en PDF stylé avec jsPDF et autotable
  const exportToPDF = async () => {
    const filteredGestures = getFilteredGestures();
    if (!filteredGestures.length) {
      setError('Aucun geste à exporter.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const doc = new jsPDF();
      // Titre principal
      doc.setFontSize(18);
      doc.text(customTitle, 14, 18);
      // Date d'export
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Date d'export : ${new Date().toLocaleDateString()}`, 14, 26);
      // Préparer les colonnes et les données pour autotable
      const tableColumns = columnsList.filter(c=>selectedColumns[c.key]).map(c=>({header: c.label, dataKey: c.key}));
      const tableData = filteredGestures;
      // Tableau stylé
      doc.autoTable({
        startY: 32,
        head: [tableColumns.map(col=>col.header)],
        body: tableData.map(row => tableColumns.map(col => row[col.dataKey])),
        styles: { fillColor: [240, 248, 255] },
        headStyles: { fillColor: [22, 160, 133], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [255,255,255] },
        margin: { left: 14, right: 14 },
      });
      doc.save(`eco-gestes-${new Date().toISOString().split('T')[0]}.pdf`);
      setSuccess('PDF exporté avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError("Impossible d'exporter en PDF");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour exporter en Excel (format CSV compatible Excel)
  const exportToExcel = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const filteredGestures = getFilteredGestures();
      if (!filteredGestures.length) {
        setError('Aucun geste à exporter.');
        return;
      }
      let content = `${customTitle}\nDate d'export : ${new Date().toLocaleDateString()}\n`;
      content += columnsList.filter(c=>selectedColumns[c.key]).map(c=>`"${c.label}"`).join(';') + '\n';
      filteredGestures.forEach(g => {
        content += columnsList.filter(c=>selectedColumns[c.key]).map(c=>`"${g[c.key]}"`).join(';') + '\n';
      });
      const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `eco-gestes-${new Date().toISOString().split('T')[0]}.xls`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccess('Fichier Excel exporté avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Impossible d\'exporter en Excel');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour exporter en CSV
  const exportToCSV = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const filteredGestures = getFilteredGestures();
      if (!filteredGestures.length) {
        setError('Aucun geste à exporter.');
        return;
      }
      let content = `${customTitle}\nDate d'export : ${new Date().toLocaleDateString()}\n`;
      content += columnsList.filter(c=>selectedColumns[c.key]).map(c=>`"${c.label}"`).join(',') + '\n';
      filteredGestures.forEach(g => {
        content += columnsList.filter(c=>selectedColumns[c.key]).map(c=>`"${g[c.key]}"`).join(',') + '\n';
      });
      const blob = new Blob([content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `eco-gestes-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccess('Fichier CSV exporté avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Impossible d\'exporter en CSV');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour exporter les statistiques
  const exportStatistics = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const response = await axios.get('/api/statistics', {
        headers: { 'x-auth-token': token }
      });

      // Créer un rapport texte
      const report = `
RAPPORT ÉCO-GESTES
Date: ${new Date().toLocaleDateString('fr-FR')}

STATISTIQUES GÉNÉRALES:
- Total des gestes: ${response.data.totalGestures}
- CO2 économisé total: ${response.data.totalCO2} kg
- CO2 économisé moyen par geste: ${response.data.averageCO2.toFixed(2)} kg

GESTES PAR CATÉGORIE:
${gestures.reduce((acc, gesture) => {
  acc[gesture.category] = (acc[gesture.category] || 0) + 1;
  return acc;
}, {}).map(([category, count]) => `- ${category}: ${count} gestes`).join('\n')}

TOP 5 DES GESTES LES PLUS EFFICACES:
${gestures
  .sort((a, b) => b.co2Saved - a.co2Saved)
  .slice(0, 5)
  .map((gesture, index) => `${index + 1}. ${gesture.name} (${gesture.co2Saved} kg CO2)`)
  .join('\n')}
      `.trim();

      // Télécharger le rapport
      const blob = new Blob([report], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-eco-gestes-${new Date().toISOString().split('T')[0]}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Rapport exporté avec succès !');
    } catch (err) {
      console.error('Erreur lors de l\'export des statistiques:', err);
      setError('Impossible d\'exporter les statistiques');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour imprimer
  const handlePrint = () => {
    window.print();
    setSuccess('Impression lancée !');
  };

  // Fonction pour partager (copie du lien)
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setSuccess('Lien copié dans le presse-papiers !');
  };

  return (
    <div className="export-tools" style={{marginTop:20}}>
      {/* Plus aucun bouton ni message d'export */}
    </div>
  );
};

export default ExportTools; 