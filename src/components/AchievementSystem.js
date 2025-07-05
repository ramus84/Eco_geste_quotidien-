import React, { useState, useEffect } from 'react';
import { Card, Badge, ProgressBar, Modal, Button, Row, Col } from 'react-bootstrap';
import { FaTrophy, FaMedal, FaStar, FaLeaf, FaRecycle, FaBolt } from 'react-icons/fa';
import axios from 'axios';

/**
 * Système de badges et récompenses
 * Gamifie l'expérience utilisateur avec des objectifs et récompenses
 */
const AchievementSystem = ({ userId, isAuthenticated }) => {
  const [achievements, setAchievements] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [loading, setLoading] = useState(false);

  // Définition des badges disponibles
  const availableBadges = [
    {
      id: 'first-gesture',
      name: 'Premier Pas',
      description: 'Ajoutez votre premier geste écologique',
      icon: <FaLeaf className="text-success" />,
      category: 'Débutant',
      points: 10,
      requirement: 1,
      type: 'gestures'
    },
    {
      id: 'eco-warrior',
      name: 'Guerrier Écologique',
      description: 'Ajoutez 10 gestes écologiques',
      icon: <FaRecycle className="text-primary" />,
      category: 'Intermédiaire',
      points: 50,
      requirement: 10,
      type: 'gestures'
    },
    {
      id: 'co2-saver',
      name: 'Sauveur de CO2',
      description: 'Économisez 100kg de CO2',
      icon: <FaBolt className="text-warning" />,
      category: 'Avancé',
      points: 100,
      requirement: 100,
      type: 'co2'
    },
    {
      id: 'community-leader',
      name: 'Leader Communautaire',
      description: 'Recevez 50 likes sur vos gestes',
      icon: <FaStar className="text-info" />,
      category: 'Social',
      points: 75,
      requirement: 50,
      type: 'likes'
    },
    {
      id: 'commentator',
      name: 'Commentateur Actif',
      description: 'Ajoutez 20 commentaires',
      icon: <FaMedal className="text-secondary" />,
      category: 'Social',
      points: 30,
      requirement: 20,
      type: 'comments'
    },
    {
      id: 'master-eco',
      name: 'Maître Écologique',
      description: 'Économisez 500kg de CO2',
      icon: <FaTrophy className="text-danger" />,
      category: 'Expert',
      points: 200,
      requirement: 500,
      type: 'co2'
    }
  ];

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadUserAchievements();
      loadUserProgress();
    }
  }, [userId, isAuthenticated]);

  const loadUserAchievements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/achievements', {
        headers: { 'x-auth-token': token }
      });
      setAchievements(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/progress', {
        headers: { 'x-auth-token': token }
      });
      setUserProgress(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement du progrès:', err);
    }
  };

  const getProgressForBadge = (badge) => {
    const progress = userProgress[badge.type] || 0;
    const percentage = Math.min((progress / badge.requirement) * 100, 100);
    return { current: progress, percentage };
  };

  const isBadgeUnlocked = (badgeId) => {
    return achievements.some(achievement => achievement.badgeId === badgeId);
  };

  const handleBadgeClick = (badge) => {
    setSelectedAchievement(badge);
    setShowModal(true);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Débutant': 'success',
      'Intermédiaire': 'primary',
      'Avancé': 'warning',
      'Social': 'info',
      'Expert': 'danger'
    };
    return colors[category] || 'secondary';
  };

  return (
    <div className="achievement-system">
      <Card className="mb-4">
        <Card.Header className="bg-gradient text-white">
          <h4 className="mb-0">
            <FaTrophy className="me-2" />
            Badges et Récompenses
          </h4>
        </Card.Header>
        <Card.Body>
          {!isAuthenticated ? (
            <div className="text-center py-4">
              <FaTrophy size={48} className="text-muted mb-3" />
              <p>Connectez-vous pour voir vos badges et récompenses !</p>
            </div>
          ) : (
            <>
              {/* Résumé des points */}
              <div className="points-summary mb-4">
                <Row>
                  <Col md={4}>
                    <div className="text-center">
                      <h3 className="text-primary">
                        {achievements.reduce((sum, a) => sum + a.points, 0)}
                      </h3>
                      <small className="text-muted">Points totaux</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <h3 className="text-success">
                        {achievements.length}
                      </h3>
                      <small className="text-muted">Badges débloqués</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <h3 className="text-info">
                        {availableBadges.length - achievements.length}
                      </h3>
                      <small className="text-muted">Badges restants</small>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Grille des badges */}
              <Row>
                {availableBadges.map((badge) => {
                  const progress = getProgressForBadge(badge);
                  const isUnlocked = isBadgeUnlocked(badge.id);
                  
                  return (
                    <Col key={badge.id} md={6} lg={4} className="mb-3">
                      <Card 
                        className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                        onClick={() => handleBadgeClick(badge)}
                      >
                        <Card.Body className="text-center">
                          <div className="badge-icon mb-2">
                            {React.cloneElement(badge.icon, { 
                              size: 32,
                              className: isUnlocked ? 'text-warning' : 'text-muted'
                            })}
                            {isUnlocked && (
                              <Badge 
                                bg="success" 
                                className="position-absolute top-0 end-0"
                              >
                                ✓
                              </Badge>
                            )}
                          </div>
                          
                          <h6 className="card-title">{badge.name}</h6>
                          <p className="card-text small text-muted">
                            {badge.description}
                          </p>
                          
                          <Badge bg={getCategoryColor(badge.category)} className="mb-2">
                            {badge.category}
                          </Badge>
                          
                          <div className="progress-info">
                            <small className="text-muted">
                              {progress.current} / {badge.requirement}
                            </small>
                            <ProgressBar 
                              now={progress.percentage} 
                              variant={isUnlocked ? 'success' : 'primary'}
                              className="mt-1"
                            />
                          </div>
                          
                          <div className="points-badge mt-2">
                            <Badge bg="warning" text="dark">
                              {badge.points} pts
                            </Badge>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal de détail du badge */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedAchievement && (
              <>
                {selectedAchievement.icon}
                {' '}
                {selectedAchievement.name}
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAchievement && (
            <>
              <p>{selectedAchievement.description}</p>
              <div className="achievement-details">
                <p><strong>Catégorie :</strong> {selectedAchievement.category}</p>
                <p><strong>Points :</strong> {selectedAchievement.points}</p>
                <p><strong>Objectif :</strong> {selectedAchievement.requirement}</p>
                {isBadgeUnlocked(selectedAchievement.id) && (
                  <div className="alert alert-success">
                    <FaTrophy className="me-2" />
                    Badge débloqué ! Félicitations !
                  </div>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AchievementSystem; 