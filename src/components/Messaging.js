import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';

const Messaging = ({ userId, username }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [toUser, setToUser] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charger les messages et la liste des utilisateurs
  useEffect(() => {
    fetchMessages();
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axiosInstance.get('/messages');
      setMessages(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des messages.');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/users'); // suppose une route qui liste les utilisateurs
      setUsers(res.data);
    } catch (err) {
      setUsers([]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!toUser || !content.trim()) {
      setError('Veuillez choisir un destinataire et écrire un message.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axiosInstance.post('/messages', { toUser, content });
      setSuccess('Message envoyé !');
      setContent('');
      fetchMessages();
    } catch (err) {
      setError('Erreur lors de l\'envoi du message.');
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/messages/${id}/read`);
      fetchMessages();
    } catch (err) {}
  };

  return (
    <div style={{margin:'30px 0',padding:'20px',background:'#f5f5f5',borderRadius:12,boxShadow:'0 1px 4px #bdbdbd'}}>
      <h3>Messagerie interne</h3>
      {/* Formulaire d'envoi */}
      <form onSubmit={handleSend} style={{marginBottom:20,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
        <select value={toUser} onChange={e=>setToUser(e.target.value)} style={{padding:8,borderRadius:4}} required>
          <option value="">Choisir un destinataire</option>
          {users.filter(u=>u._id!==userId).map(u=>(
            <option key={u._id} value={u._id}>{u.username} ({u.email})</option>
          ))}
        </select>
        <input type="text" value={content} onChange={e=>setContent(e.target.value)} placeholder="Votre message..." style={{flex:1,padding:8,borderRadius:4}} required />
        <button type="submit" style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:4,padding:'8px 16px'}} disabled={loading}>{loading ? 'Envoi...' : 'Envoyer'}</button>
      </form>
      {error && <div style={{color:'red',marginBottom:10}}>{error}</div>}
      {success && <div style={{color:'green',marginBottom:10}}>{success}</div>}
      {/* Liste des messages */}
      <div style={{maxHeight:350,overflowY:'auto',background:'#fff',borderRadius:8,padding:12}}>
        {messages.length === 0 ? (
          <div style={{color:'#888'}}>Aucun message pour le moment.</div>
        ) : (
          <ul style={{listStyle:'none',padding:0}}>
            {messages.map(msg => (
              <li key={msg._id} style={{marginBottom:14,padding:10,borderRadius:6,background:msg.read ? '#e0e0e0' : '#c8e6c9',position:'relative'}}>
                <div style={{fontWeight:'bold',color:'#1976d2'}}>
                  {msg.fromUser.username} ➔ {msg.toUser.username}
                  {msg.toUser._id === userId && !msg.read && (
                    <span style={{color:'#388e3c',marginLeft:8,fontWeight:'bold'}}>Nouveau</span>
                  )}
                </div>
                <div style={{margin:'6px 0'}}>{msg.content}</div>
                <div style={{fontSize:12,color:'#888'}}>{new Date(msg.date).toLocaleString()}</div>
                {msg.toUser._id === userId && !msg.read && (
                  <button onClick={()=>markAsRead(msg._id)} style={{position:'absolute',top:10,right:10,background:'#388e3c',color:'#fff',border:'none',borderRadius:4,padding:'4px 10px',fontSize:12,cursor:'pointer'}}>Marquer comme lu</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Messaging; 