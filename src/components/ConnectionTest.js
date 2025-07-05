import React, { useState, useEffect } from 'react';
import { testConnection } from '../axiosConfig';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaWifi } from 'react-icons/fa';
import './ConnectionTest.css';

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastTest, setLastTest] = useState(null);

  const testBackendConnection = async () => {
    setConnectionStatus('testing');
    setErrorMessage('');
    
    try {
      console.log('🔍 Test de connexion au backend...');
      const isConnected = await testConnection();
      
      if (isConnected) {
        setConnectionStatus('connected');
        console.log('✅ Connexion réussie');
      } else {
        setConnectionStatus('failed');
        setErrorMessage('Impossible de se connecter au serveur backend');
        console.log('❌ Échec de la connexion');
      }
    } catch (error) {
      setConnectionStatus('failed');
      setErrorMessage(error.message || 'Erreur inconnue');
      console.error('❌ Erreur de test:', error);
    }
    
    setLastTest(new Date());
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <FaCheckCircle className="status-icon connected" />;
      case 'failed':
        return <FaTimesCircle className="status-icon failed" />;
      case 'testing':
        return <FaSpinner className="status-icon testing" />;
      default:
        return <FaWifi className="status-icon" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connecté au serveur';
      case 'failed':
        return 'Erreur de connexion';
      case 'testing':
        return 'Test en cours...';
      default:
        return 'État inconnu';
    }
  };

  return (
    <div className="connection-test">
      <div className="connection-header">
        <h4>Test de Connexion Backend</h4>
        <button 
          onClick={testBackendConnection}
          className="retry-button"
          disabled={connectionStatus === 'testing'}
        >
          <FaWifi /> Retester
        </button>
      </div>
      
      <div className="connection-status">
        {getStatusIcon()}
        <span className="status-text">{getStatusText()}</span>
      </div>
      
      {errorMessage && (
        <div className="error-message">
          <strong>Erreur :</strong> {errorMessage}
        </div>
      )}
      
      {lastTest && (
        <div className="last-test">
          Dernier test : {lastTest.toLocaleTimeString()}
        </div>
      )}
      
      <div className="connection-info">
        <h5>Informations de débogage :</h5>
        <ul>
          <li><strong>URL Backend :</strong> http://localhost:5000</li>
          <li><strong>URL Frontend :</strong> http://localhost:3000</li>
          <li><strong>Route de test :</strong> /api/health</li>
        </ul>
      </div>
      
      <div className="troubleshooting">
        <h5>Dépannage :</h5>
        <ol>
          <li>Vérifiez que le backend est démarré (port 5000)</li>
          <li>Vérifiez que MongoDB est en cours d'exécution</li>
          <li>Vérifiez les logs du serveur backend</li>
          <li>Vérifiez que le fichier .env est configuré</li>
        </ol>
      </div>
    </div>
  );
};

export default ConnectionTest; 