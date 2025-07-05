import React, { useState, useEffect } from 'react';
import { Card, Form, Button, ListGroup, Badge, Alert } from 'react-bootstrap';
import { FaThumbsUp, FaComment, FaUser, FaClock } from 'react-icons/fa';
import axios from 'axios';

/**
 * Composant système de commentaires
 * Permet aux utilisateurs de commenter et liker les gestes écologiques
 */
const CommentSystem = ({ gestureId, isAuthenticated }) => {
  // États pour gérer les commentaires et les likes
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);

  // Charger les commentaires au montage du composant
  useEffect(() => {
    if (gestureId) {
      loadComments();
      loadLikes();
    }
  }, [gestureId]);

  // Fonction pour charger les commentaires depuis l'API
  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/gestures/${gestureId}/comments`);
      setComments(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des commentaires:', err);
      setError('Impossible de charger les commentaires');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les likes
  const loadLikes = async () => {
    try {
      const response = await axios.get(`/api/gestures/${gestureId}/likes`);
      setLikes(response.data.likes);
      setUserLiked(response.data.userLiked);
    } catch (err) {
      console.error('Erreur lors du chargement des likes:', err);
    }
  };

  // Fonction pour ajouter un commentaire
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      setError('Le commentaire ne peut pas être vide');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/gestures/${gestureId}/comments`,
        { content: newComment },
        {
          headers: { 'x-auth-token': token }
        }
      );

      // Ajouter le nouveau commentaire à la liste
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Erreur lors de l\'ajout du commentaire:', err);
      setError('Impossible d\'ajouter le commentaire');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour liker/unliker
  const handleLike = async () => {
    if (!isAuthenticated) {
      setError('Vous devez être connecté pour liker');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/gestures/${gestureId}/like`,
        {},
        {
          headers: { 'x-auth-token': token }
        }
      );

      setLikes(response.data.likes);
      setUserLiked(response.data.userLiked);
    } catch (err) {
      console.error('Erreur lors du like:', err);
      setError('Impossible de liker ce geste');
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="comment-system">
      <Card.Header className="bg-success text-white">
        <h5 className="mb-0">
          <FaComment className="me-2" />
          Commentaires et réactions
        </h5>
      </Card.Header>
      
      <Card.Body>
        {/* Section des likes */}
        <div className="likes-section mb-3">
          <Button
            variant={userLiked ? 'success' : 'outline-success'}
            onClick={handleLike}
            disabled={!isAuthenticated}
            className="me-2"
          >
            <FaThumbsUp className="me-1" />
            {likes} {likes === 1 ? 'like' : 'likes'}
          </Button>
          {!isAuthenticated && (
            <small className="text-muted">
              Connectez-vous pour liker ce geste
            </small>
          )}
        </div>

        {/* Formulaire d'ajout de commentaire */}
        {isAuthenticated && (
          <Form onSubmit={handleSubmitComment} className="mb-4">
            <Form.Group>
              <Form.Label>Ajouter un commentaire :</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Partagez votre expérience avec ce geste écologique..."
                disabled={loading}
              />
            </Form.Group>
            <Button 
              type="submit" 
              variant="success" 
              disabled={loading || !newComment.trim()}
              className="mt-2"
            >
              {loading ? 'Envoi...' : 'Publier le commentaire'}
            </Button>
          </Form>
        )}

        {/* Message d'erreur */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Liste des commentaires */}
        <div className="comments-list">
          <h6>Commentaires ({comments.length})</h6>
          
          {loading && comments.length === 0 ? (
            <div className="text-center py-3">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-3 text-muted">
              <FaComment className="mb-2" size={24} />
              <p>Aucun commentaire pour le moment.</p>
              {isAuthenticated && (
                <p>Soyez le premier à commenter !</p>
              )}
            </div>
          ) : (
            <ListGroup>
              {comments.map((comment) => (
                <ListGroup.Item key={comment._id} className="comment-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-2">
                        <FaUser className="text-success me-2" />
                        <strong>{comment.user.username}</strong>
                        <Badge bg="secondary" className="ms-2">
                          {comment.user.role || 'Utilisateur'}
                        </Badge>
                      </div>
                      <p className="mb-2">{comment.content}</p>
                      <small className="text-muted">
                        <FaClock className="me-1" />
                        {formatDate(comment.createdAt)}
                      </small>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default CommentSystem; 