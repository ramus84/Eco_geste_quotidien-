import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { FaFilePdf, FaFileExcel, FaUser, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const CarbonHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [isAdmin] = useState(false); // À personnaliser si tu veux un vrai admin
  const [users, setUsers] = useState([]); // Liste des utilisateurs (pour admin)
  const [editId, setEditId] = useState(null); // ID du calcul en cours d'édition
  const [editForm, setEditForm] = useState({ emissions: '', economies: '', conseils: '' });
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userId'));

  // Récupère l'historique au chargement ou quand on filtre
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const params = userIdFilter ? { userId: userIdFilter } : {};
        const res = await axiosInstance.get('/stats/carboncalculations', {
          headers: { Authorization: 'Bearer ' + token },
          params
        });
        setHistory(res.data);
      } catch (err) {
        setError("Erreur lors du chargement de l'historique");
      }
      setLoading(false);
    };
    fetchHistory();
  }, [userIdFilter]);

  // Récupère la liste des utilisateurs si admin
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/users', { headers: { Authorization: 'Bearer ' + token } });
        setUsers(res.data);
      } catch {}
    };
    fetchUsers();
  }, [isAdmin]);

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Historique des calculs CO₂', 10, 10);
    history.forEach((item, i) => {
      doc.text(`Calcul #${i + 1} - ${new Date(item.date).toLocaleString()}`, 10, 20 + i * 40);
      doc.text(`Émissions : ${item.emissions} kg CO₂`, 10, 28 + i * 40);
      doc.text(`Économies : ${item.economies} kg CO₂`, 10, 36 + i * 40);
      doc.text(`Transport : ${item.repartition.transport} | Énergie : ${item.repartition.energie} | Alimentation : ${item.repartition.alimentation}`, 10, 44 + i * 40);
      if (item.conseils && item.conseils.length > 0) {
        doc.text('Conseils :', 10, 52 + i * 40);
        item.conseils.forEach((c, j) => doc.text(`- ${c}`, 14, 58 + i * 40 + j * 6));
      }
    });
    doc.save('historique-co2.pdf');
  };

  // Export Excel
  const handleExportExcel = () => {
    const data = history.map((item, i) => ({
      Date: new Date(item.date).toLocaleString(),
      'Émissions (kg CO₂)': item.emissions,
      'Économies (kg CO₂)': item.economies,
      'Transport': item.repartition.transport,
      'Énergie': item.repartition.energie,
      'Alimentation': item.repartition.alimentation,
      'Conseils': (item.conseils || []).join(' | ')
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historique CO2');
    XLSX.writeFile(workbook, 'historique-co2.xlsx');
  };

  // Fonction pour supprimer un calcul
  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression de ce calcul ?')) return;
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`/stats/carboncalculations/${id}`, { headers: { Authorization: 'Bearer ' + token } });
      setHistory(history.filter(item => item._id !== id));
    } catch {
      alert('Erreur lors de la suppression');
    }
  };
  // Fonction pour ouvrir le formulaire de modification
  const handleEdit = (item) => {
    setEditId(item._id);
    setEditForm({
      emissions: item.emissions,
      economies: item.economies,
      conseils: (item.conseils || []).join('\n')
    });
  };
  // Fonction pour annuler la modification
  const handleCancelEdit = () => {
    setEditId(null);
    setEditForm({ emissions: '', economies: '', conseils: '' });
  };
  // Fonction pour sauvegarder la modification
  const handleSaveEdit = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(`/stats/carboncalculations/${id}`, {
        emissions: Number(editForm.emissions),
        economies: Number(editForm.economies),
        conseils: editForm.conseils.split('\n').map(c => c.trim()).filter(Boolean)
      }, { headers: { Authorization: 'Bearer ' + token } });
      // Recharge la liste
      setEditId(null);
      setEditForm({ emissions: '', economies: '', conseils: '' });
      // Recharge l'historique
      const params = userIdFilter ? { userId: userIdFilter } : {};
      const res = await axiosInstance.get('/stats/carboncalculations', {
        headers: { Authorization: 'Bearer ' + token },
        params
      });
      setHistory(res.data);
    } catch {
      alert('Erreur lors de la modification');
    }
  };

  return (
    <div className="carbon-history-card">
      <h2 className="carbon-calc-title">Historique de mes calculs CO₂</h2>
      {isAdmin && (
        <div style={{marginBottom:18}}>
          <label style={{color:'#1976d2',fontWeight:500}}><FaUser style={{marginRight:6}}/>Filtrer par utilisateur :
            <select value={userIdFilter} onChange={e => setUserIdFilter(e.target.value)} style={{marginLeft:8, borderRadius:8, border:'1px solid #b2dfdb', padding:'4px 10px'}}>
              <option value="">Tous</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.username} ({u.email}){u.isAdmin ? ' [admin]' : ''}</option>)}
            </select>
          </label>
        </div>
      )}
      <div style={{display:'flex', gap:12, marginBottom:18, flexWrap:'wrap'}}>
        <button className="carbon-calc-action-btn" onClick={handleExportPDF}><FaFilePdf style={{marginRight:6}}/> Exporter PDF</button>
        <button className="carbon-calc-action-btn" onClick={handleExportExcel}><FaFileExcel style={{marginRight:6}}/> Exporter Excel</button>
      </div>
      {loading ? <div style={{textAlign:'center',margin:'32px'}}>Chargement...</div> : error ? <div className="auth-error">{error}</div> : (
        <div className="carbon-history-list">
          {history.length === 0 ? <div style={{textAlign:'center',margin:'32px'}}>Aucun calcul enregistré.</div> : history.map((item, i) => {
            const canEdit = isAdmin || String(item.userId) === String(currentUserId);
            return (
              <div className="carbon-history-item" key={item._id || i}>
                <div className="carbon-history-date">{new Date(item.date).toLocaleString()}</div>
                {editId === item._id ? (
                  <div style={{marginBottom:8}}>
                    <div className="carbon-history-row"><b>Émissions :</b> <input type="number" value={editForm.emissions} onChange={e => setEditForm(f => ({...f, emissions: e.target.value}))} style={{width:90,marginLeft:8}} /></div>
                    <div className="carbon-history-row"><b>Économies :</b> <input type="number" value={editForm.economies} onChange={e => setEditForm(f => ({...f, economies: e.target.value}))} style={{width:90,marginLeft:8}} /></div>
                    <div className="carbon-history-row"><b>Conseils :</b> <textarea value={editForm.conseils} onChange={e => setEditForm(f => ({...f, conseils: e.target.value}))} rows={2} style={{width:'98%',marginLeft:8}} /></div>
                    <button className="carbon-calc-action-btn" onClick={() => handleSaveEdit(item._id)} style={{marginRight:8}}><FaSave style={{marginRight:4}}/>Sauvegarder</button>
                    <button className="carbon-calc-action-btn" onClick={handleCancelEdit}><FaTimes style={{marginRight:4}}/>Annuler</button>
                  </div>
                ) : (
                  <>
                    <div className="carbon-history-row"><b>Émissions :</b> {item.emissions} kg CO₂</div>
                    <div className="carbon-history-row"><b>Économies :</b> {item.economies} kg CO₂</div>
                    <div className="carbon-history-row"><b>Transport :</b> {item.repartition.transport} | <b>Énergie :</b> {item.repartition.energie} | <b>Alimentation :</b> {item.repartition.alimentation}</div>
                    {item.conseils && item.conseils.length > 0 && (
                      <div className="carbon-history-row"><b>Conseils :</b> <ul style={{margin:0,paddingLeft:18}}>{item.conseils.map((c,j) => <li key={j}>{c}</li>)}</ul></div>
                    )}
                  </>
                )}
                {/* Boutons actions */}
                {canEdit && editId !== item._id && (
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button className="carbon-calc-action-btn" style={{background:'#ff7043'}} onClick={() => handleDelete(item._id)}><FaTrash style={{marginRight:4}}/>Supprimer</button>
                    <button className="carbon-calc-action-btn" onClick={() => handleEdit(item)}><FaEdit style={{marginRight:4}}/>Modifier</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CarbonHistory; 