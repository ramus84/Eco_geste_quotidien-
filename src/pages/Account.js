import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';

function Account() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '', city: '' });
  const [editMsg, setEditMsg] = useState('');
  const [pwdForm, setPwdForm] = useState({ old: '', new1: '', new2: '' });
  const [pwdMsg, setPwdMsg] = useState('');
  // Ajout pour l'upload d'avatar
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Vous devez être connecté pour accéder au profil utilisateur.");
          setLoading(false);
          return;
        }
        const res = await axiosInstance.get('/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
        if (res.data.avatarUrl) setAvatarPreview(res.data.avatarUrl);
      } catch (err) {
        if (err?.response?.status === 401) {
          setError("Session expirée. Veuillez vous reconnecter.");
        } else if (err?.response?.status === 404) {
          setError("Profil utilisateur non trouvé.");
        } else {
          setError("Impossible de charger le profil utilisateur.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  // Gestion du changement d'avatar (fichier choisi)
  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        setAvatarPreview(ev.target.result);
        setAvatarFile(ev.target.result); // On stocke le base64
      };
      reader.readAsDataURL(file);
    }
  };

  // Sauvegarde de l'avatar dans le localStorage (et dans le user local)
  const handleAvatarSave = () => {
    if (avatarFile) {
      // On met à jour le user local et dans le localStorage
      const updatedUser = { ...user, avatarUrl: avatarFile };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAvatarFile(null);
    }
  };

  const openEdit = () => {
    setEditForm({ username: user.username, email: user.email, city: user.city || '' });
    setEditMsg('');
    setShowEdit(true);
  };
  const openPwd = () => {
    setPwdForm({ old: '', new1: '', new2: '' });
    setPwdMsg('');
    setShowPwd(true);
  };

  const handleEditChange = e => setEditForm({ ...editForm, [e.target.name]: e.target.value });
  const handlePwdChange = e => setPwdForm({ ...pwdForm, [e.target.name]: e.target.value });

  const handleEditSubmit = async e => {
    e.preventDefault();
    setEditMsg('');
    try {
      await axiosInstance.put('/users/profile', editForm);
      setEditMsg('Profil mis à jour !');
      setUser(u => ({ ...u, ...editForm }));
      setTimeout(() => setShowEdit(false), 1200);
    } catch (err) {
      setEditMsg(err?.response?.data?.error || 'Erreur lors de la modification.');
    }
  };
  const handlePwdSubmit = async e => {
    e.preventDefault();
    setPwdMsg('');
    if (pwdForm.new1 !== pwdForm.new2) {
      setPwdMsg('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    try {
      await axiosInstance.put('/users/change-password', {
        currentPassword: pwdForm.old,
        newPassword: pwdForm.new1
      });
      setPwdMsg('Mot de passe modifié !');
      setTimeout(() => setShowPwd(false), 1200);
    } catch (err) {
      setPwdMsg(err?.response?.data?.error || 'Erreur lors du changement de mot de passe.');
    }
  };

  if (loading) return <div style={{textAlign:'center',marginTop:40}}>Chargement du profil...</div>;
  if (error) return <div style={{color:'#c62828',textAlign:'center',marginTop:40}}>{error}</div>;
  if (!user) return null;

  return (
    <div style={{maxWidth:500,margin:'40px auto',background:'#f5f5f5',borderRadius:16,padding:32,boxShadow:'0 4px 24px #0001'}}>
      <div style={{display:'flex',alignItems:'center',gap:24,marginBottom:24}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'#1976d2',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,fontWeight:'bold',boxShadow:'0 2px 8px #1976d233',position:'relative'}}>
          {/* Affichage de l'avatar ou initiale */}
          {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} /> : user.username?.[0]?.toUpperCase()}
          {/* Bouton changer d'avatar */}
          <label htmlFor="avatar-upload" style={{position:'absolute',bottom:-8,right:-8,background:'#43c59e',color:'#fff',borderRadius:'50%',padding:7,cursor:'pointer',boxShadow:'0 2px 8px #43c59e33',fontSize:18,border:'2px solid #fff'}} title="Changer d'avatar">✎
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} style={{display:'none'}} />
          </label>
        </div>
        <div>
          <div style={{fontSize:'1.5rem',fontWeight:'bold',color:'#1976d2'}}>{user.username}</div>
          <div style={{color:'#388e3c',fontSize:'1.1rem'}}>{user.city || 'Ville non renseignée'}</div>
          <div style={{color:'#555',fontSize:'1rem'}}>{user.email}</div>
        </div>
      </div>
      {/* Aperçu et bouton d'enregistrement de l'avatar */}
      {avatarFile && (
        <div style={{marginBottom:16}}>
          <button onClick={handleAvatarSave} style={{background:'#43c59e',color:'#fff',border:'none',borderRadius:10,padding:'8px 18px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 2px 8px #43c59e33',marginTop:6}}>Enregistrer l'avatar</button>
        </div>
      )}
      <div style={{marginBottom:18}}>
        <button onClick={openEdit} style={{background:'#43e97b',color:'#fff',border:'none',borderRadius:12,padding:'10px 22px',fontWeight:'bold',marginRight:12,cursor:'pointer',boxShadow:'0 2px 8px #43e97b33'}}>Modifier le profil</button>
        <button onClick={openPwd} style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:12,padding:'10px 22px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 2px 8px #1976d233'}}>Changer le mot de passe</button>
      </div>
      <div style={{marginTop:18,color:'#888',fontSize:'0.98rem'}}>Dernière connexion : {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}</div>

      {/* Modale Modifier le profil */}
      {showEdit && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.18)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <form onSubmit={handleEditSubmit} style={{background:'#fff',padding:32,borderRadius:16,boxShadow:'0 8px 32px #0003',minWidth:320,maxWidth:400,position:'relative'}}>
            <button type="button" onClick={()=>setShowEdit(false)} style={{position:'absolute',top:10,right:16,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888'}}>×</button>
            <h3 style={{marginBottom:18}}>Modifier le profil</h3>
            <input name="username" placeholder="Nom" value={editForm.username} onChange={handleEditChange} required style={{display:'block',marginBottom:12,width:'100%'}} />
            <input name="email" placeholder="Email" value={editForm.email} onChange={handleEditChange} required type="email" style={{display:'block',marginBottom:12,width:'100%'}} />
            <input name="city" placeholder="Ville" value={editForm.city} onChange={handleEditChange} style={{display:'block',marginBottom:12,width:'100%'}} />
            <button type="submit" style={{background:'#43e97b',color:'#fff',border:'none',borderRadius:10,padding:'10px 22px',fontWeight:'bold',marginTop:8,cursor:'pointer'}}>Enregistrer</button>
            {editMsg && <div style={{marginTop:10,color:editMsg.includes('Erreur')?'#c62828':'#388e3c',fontWeight:'bold'}}>{editMsg}</div>}
          </form>
        </div>
      )}
      {/* Modale Changer le mot de passe */}
      {showPwd && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.18)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <form onSubmit={handlePwdSubmit} style={{background:'#fff',padding:32,borderRadius:16,boxShadow:'0 8px 32px #0003',minWidth:320,maxWidth:400,position:'relative'}}>
            <button type="button" onClick={()=>setShowPwd(false)} style={{position:'absolute',top:10,right:16,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888'}}>×</button>
            <h3 style={{marginBottom:18}}>Changer le mot de passe</h3>
            <input name="old" placeholder="Ancien mot de passe" value={pwdForm.old} onChange={handlePwdChange} required type="password" style={{display:'block',marginBottom:12,width:'100%'}} />
            <input name="new1" placeholder="Nouveau mot de passe" value={pwdForm.new1} onChange={handlePwdChange} required type="password" style={{display:'block',marginBottom:12,width:'100%'}} />
            <input name="new2" placeholder="Confirmer le nouveau mot de passe" value={pwdForm.new2} onChange={handlePwdChange} required type="password" style={{display:'block',marginBottom:12,width:'100%'}} />
            <button type="submit" style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:10,padding:'10px 22px',fontWeight:'bold',marginTop:8,cursor:'pointer'}}>Valider</button>
            {pwdMsg && <div style={{marginTop:10,color:pwdMsg.includes('Erreur')?'#c62828':'#388e3c',fontWeight:'bold'}}>{pwdMsg}</div>}
          </form>
        </div>
      )}
    </div>
  );
}

export default Account; 