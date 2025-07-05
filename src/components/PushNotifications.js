import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Form, Badge, ListGroup } from 'react-bootstrap';
import { FaBell, FaBellSlash, FaCog, FaCheck, FaTimes } from 'react-icons/fa';

/**
 * Composant pour gérer les notifications push
 * Permet aux utilisateurs de s'abonner aux notifications et de les configurer
 */
const PushNotifications = () => {
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    dailyReminder: true,
    weeklyReport: true,
    newGestures: true,
    achievements: true
  });

  // Vérifier les permissions au montage du composant
  useEffect(() => {
    checkNotificationPermission();
    checkSubscription();
  }, []);

  // Fonction pour vérifier les permissions de notification
  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  // Fonction pour vérifier l'abonnement existant
  const checkSubscription = async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        setSubscription(existingSubscription);
      }
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'abonnement:', err);
    }
  };

  // Fonction pour demander les permissions
  const requestPermission = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        setSuccess('Permissions accordées ! Vous pouvez maintenant vous abonner aux notifications.');
        await subscribeToNotifications();
      } else {
        setError('Permissions refusées. Vous ne recevrez pas de notifications.');
      }
    } catch (err) {
      console.error('Erreur lors de la demande de permissions:', err);
      setError('Erreur lors de la demande de permissions');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour s'abonner aux notifications
  const subscribeToNotifications = async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        
        // Générer les clés VAPID (en production, ces clés viennent du serveur)
        const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa1l9aPqkSgxSrxzCzOLC8od_K8ev29cLHYfXt5NnugzXaKqJ2uqJDCuuoWf3Y';
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey
        });

        // Envoyer l'abonnement au serveur
        const token = localStorage.getItem('token');
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            settings
          })
        });

        setSubscription(subscription);
        setSuccess('Abonnement aux notifications réussi !');
      }
    } catch (err) {
      console.error('Erreur lors de l\'abonnement:', err);
      setError('Erreur lors de l\'abonnement aux notifications');
    }
  };

  // Fonction pour se désabonner
  const unsubscribeFromNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      if (subscription) {
        await subscription.unsubscribe();
        
        // Informer le serveur
        const token = localStorage.getItem('token');
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({
            subscription: subscription.toJSON()
          })
        });

        setSubscription(null);
        setSuccess('Désabonnement réussi !');
      }
    } catch (err) {
      console.error('Erreur lors du désabonnement:', err);
      setError('Erreur lors du désabonnement');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour les paramètres
  const updateSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      
      if (subscription) {
        const token = localStorage.getItem('token');
        await fetch('/api/notifications/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            settings: newSettings
          })
        });
        
        setSuccess('Paramètres mis à jour !');
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour des paramètres:', err);
      setError('Erreur lors de la mise à jour des paramètres');
    }
  };

  // Fonction pour tester une notification
  const testNotification = () => {
    if (permission === 'granted') {
      new Notification('🌱 Test Éco-Gestes', {
        body: 'Ceci est une notification de test pour vérifier que tout fonctionne !',
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: 'test-notification'
      });
    }
  };

  return (
    <Card className="push-notifications">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <FaBell className="me-2" />
          Notifications Push
        </h5>
      </Card.Header>
      
      <Card.Body>
        {/* Messages de succès et d'erreur */}
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} style={{display:'flex',alignItems:'center',gap:10,background:'#ffebee',color:'#b71c1c',fontWeight:'bold',border:'1.5px solid #e57373',boxShadow:'0 2px 8px #ffcdd2',fontSize:16}}>
            <FaTimes style={{fontSize:22}} />
            {error.includes('abonnement') ? (
              <span>
                Erreur l'abonnement aux notifications.<br/>
                <span style={{fontWeight:'normal',fontSize:15}}>
                  Vérifie que tu as bien accepté les permissions, que ton navigateur supporte les notifications push, et que tu es bien connecté à Internet.<br/>
                  Si le problème persiste, essaie de recharger la page ou d'utiliser un autre navigateur.
                </span>
              </span>
            ) : error}
          </Alert>
        )}

        {/* Statut des permissions */}
        <div className="permission-status mb-3">
          <h6>Statut des permissions :</h6>
          <Badge 
            bg={permission === 'granted' ? 'success' : permission === 'denied' ? 'danger' : 'warning'}
            className="mb-2"
          >
            {permission === 'granted' ? 'Autorisées' : 
             permission === 'denied' ? 'Refusées' : 'Non définies'}
          </Badge>
          
          {permission === 'default' && (
            <p className="text-muted small">
              Les notifications vous permettront de recevoir des rappels quotidiens 
              et des conseils pour vos gestes écologiques.
            </p>
          )}
        </div>

        {/* Bouton moderne pour s'abonner ou se désabonner */}
        <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:16}}>
          {permission !== 'granted' ? (
            <Button
              style={{
                background: 'linear-gradient(90deg,#1976d2,#42a5f5)',
                color: 'white',
                border: 'none',
                borderRadius: 24,
                padding: '10px 24px',
                fontWeight: 'bold',
                fontSize: 16,
                boxShadow: '0 2px 8px #90caf9',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                transition: 'background 0.2s, transform 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              onClick={requestPermission}
              disabled={loading}
            >
              <FaBell style={{fontSize:20,animation: loading ? 'ring 1s infinite' : 'none'}} />
              S'abonner aux notifications
            </Button>
          ) : subscription ? (
            <Button
              style={{
                background: 'linear-gradient(90deg,#e53935,#e35d5b)',
                color: 'white',
                border: 'none',
                borderRadius: 24,
                padding: '10px 24px',
                fontWeight: 'bold',
                fontSize: 16,
                boxShadow: '0 2px 8px #f8bbd0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                transition: 'background 0.2s, transform 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              onClick={unsubscribeFromNotifications}
              disabled={loading}
            >
              <FaBellSlash style={{fontSize:20}} />
              Se désabonner
            </Button>
          ) : (
            <Button
              style={{
                background: 'linear-gradient(90deg,#43a047,#66bb6a)',
                color: 'white',
                border: 'none',
                borderRadius: 24,
                padding: '10px 24px',
                fontWeight: 'bold',
                fontSize: 16,
                boxShadow: '0 2px 8px #a5d6a7',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                transition: 'background 0.2s, transform 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              onClick={subscribeToNotifications}
              disabled={loading}
            >
              <FaBell style={{fontSize:20,animation: loading ? 'ring 1s infinite' : 'none'}} />
              S'abonner aux notifications
            </Button>
          )}
          {/* Bouton pour tester une notification */}
          <Button
            style={{
              background: 'linear-gradient(90deg,#ffb300,#ffe082)',
              color: '#333',
              border: 'none',
              borderRadius: 24,
              padding: '10px 24px',
              fontWeight: 'bold',
              fontSize: 16,
              boxShadow: '0 2px 8px #ffe082',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              transition: 'background 0.2s, transform 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            onClick={testNotification}
            disabled={permission !== 'granted'}
          >
            <FaCheck style={{fontSize:20}} />
            Tester une notification
          </Button>
        </div>
        {/* Animation cloche */}
        <style>{`
          @keyframes ring {
            0% { transform: rotate(0); }
            10% { transform: rotate(15deg); }
            20% { transform: rotate(-10deg); }
            30% { transform: rotate(7deg); }
            40% { transform: rotate(-5deg); }
            50% { transform: rotate(3deg); }
            60% { transform: rotate(-2deg); }
            70% { transform: rotate(1deg); }
            80% { transform: rotate(-1deg); }
            90% { transform: rotate(0.5deg); }
            100% { transform: rotate(0); }
          }
        `}</style>

        {/* Paramètres des notifications */}
        {permission === 'granted' && (
          <div className="notification-settings">
            <h6>Paramètres des notifications :</h6>
            <ListGroup>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Rappel quotidien</strong>
                  <br />
                  <small className="text-muted">
                    Recevoir un rappel chaque jour pour faire un geste écologique
                  </small>
                </div>
                <Form.Check
                  type="switch"
                  checked={settings.dailyReminder}
                  onChange={(e) => updateSettings({
                    ...settings,
                    dailyReminder: e.target.checked
                  })}
                />
              </ListGroup.Item>

              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Rapport hebdomadaire</strong>
                  <br />
                  <small className="text-muted">
                    Recevoir un résumé de vos gestes de la semaine
                  </small>
                </div>
                <Form.Check
                  type="switch"
                  checked={settings.weeklyReport}
                  onChange={(e) => updateSettings({
                    ...settings,
                    weeklyReport: e.target.checked
                  })}
                />
              </ListGroup.Item>

              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Nouveaux gestes</strong>
                  <br />
                  <small className="text-muted">
                    Être informé des nouveaux gestes disponibles
                  </small>
                </div>
                <Form.Check
                  type="switch"
                  checked={settings.newGestures}
                  onChange={(e) => updateSettings({
                    ...settings,
                    newGestures: e.target.checked
                  })}
                />
              </ListGroup.Item>

              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Réalisations</strong>
                  <br />
                  <small className="text-muted">
                    Recevoir des notifications pour vos objectifs atteints
                  </small>
                </div>
                <Form.Check
                  type="switch"
                  checked={settings.achievements}
                  onChange={(e) => updateSettings({
                    ...settings,
                    achievements: e.target.checked
                  })}
                />
              </ListGroup.Item>
            </ListGroup>
          </div>
        )}

        {/* Informations supplémentaires */}
        <div className="mt-3">
          <small className="text-muted">
            <FaCog className="me-1" />
            Les notifications sont envoyées uniquement pendant les heures de veille 
            et peuvent être désactivées à tout moment.
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PushNotifications; 