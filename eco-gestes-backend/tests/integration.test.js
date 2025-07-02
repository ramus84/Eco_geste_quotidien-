const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const Gesture = require('../models/Gesture');

/**
 * Tests d'intégration pour l'API Éco-Gestes
 * Teste toutes les fonctionnalités principales de l'application
 */
describe('🌱 API Éco-Gestes - Tests d\'intégration', () => {
  let testUser;
  let testToken;
  let testGesture;

  // Configuration avant tous les tests
  beforeAll(async () => {
    // Connexion à la base de données de test
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Créer un utilisateur de test
    testUser = await createTestUser(User);
    testToken = generateTestToken(testUser._id);
  });

  // Nettoyage après chaque test
  afterEach(async () => {
    // Nettoyer les collections
    await User.deleteMany({});
    await Gesture.deleteMany({});
    
    // Recréer l'utilisateur de test
    testUser = await createTestUser(User);
    testToken = generateTestToken(testUser._id);
  });

  // Nettoyage final
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('🔐 Authentification', () => {
    test('POST /api/users/register - Inscription d\'un nouvel utilisateur', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('POST /api/users/login - Connexion utilisateur', async () => {
      const loginData = {
        email: testUser.email,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    test('GET /api/users/profile - Récupération du profil', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('x-auth-token', testToken)
        .expect(200);

      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('email');
      expect(response.body).not.toHaveProperty('password');
    });
  });

  describe('📝 Gestion des Gestes', () => {
    test('POST /api/gestures - Créer un nouveau geste', async () => {
      const gestureData = {
        name: 'Prendre le vélo',
        description: 'Aller au travail en vélo au lieu de la voiture',
        co2Saved: 2.5,
        category: 'Transport'
      };

      const response = await request(app)
        .post('/api/gestures')
        .set('x-auth-token', testToken)
        .send(gestureData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(gestureData.name);
      expect(response.body.co2Saved).toBe(gestureData.co2Saved);
      expect(response.body.userId).toBe(testUser._id.toString());
    });

    test('GET /api/gestures - Récupérer tous les gestes', async () => {
      // Créer quelques gestes de test
      await createTestGesture(Gesture, testUser._id, { name: 'Geste 1' });
      await createTestGesture(Gesture, testUser._id, { name: 'Geste 2' });

      const response = await request(app)
        .get('/api/gestures')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    test('GET /api/gestures/:id - Récupérer un geste spécifique', async () => {
      const gesture = await createTestGesture(Gesture, testUser._id);

      const response = await request(app)
        .get(`/api/gestures/${gesture._id}`)
        .expect(200);

      expect(response.body._id).toBe(gesture._id.toString());
      expect(response.body.name).toBe(gesture.name);
    });

    test('PUT /api/gestures/:id - Modifier un geste', async () => {
      const gesture = await createTestGesture(Gesture, testUser._id);
      const updateData = { name: 'Geste modifié' };

      const response = await request(app)
        .put(`/api/gestures/${gesture._id}`)
        .set('x-auth-token', testToken)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
    });

    test('DELETE /api/gestures/:id - Supprimer un geste', async () => {
      const gesture = await createTestGesture(Gesture, testUser._id);

      await request(app)
        .delete(`/api/gestures/${gesture._id}`)
        .set('x-auth-token', testToken)
        .expect(200);

      // Vérifier que le geste a été supprimé
      const deletedGesture = await Gesture.findById(gesture._id);
      expect(deletedGesture).toBeNull();
    });
  });

  describe('💬 Commentaires', () => {
    beforeEach(async () => {
      testGesture = await createTestGesture(Gesture, testUser._id);
    });

    test('POST /api/gestures/:id/comments - Ajouter un commentaire', async () => {
      const commentData = {
        content: 'Excellent geste ! Je le fais aussi.'
      };

      const response = await request(app)
        .post(`/api/gestures/${testGesture._id}/comments`)
        .set('x-auth-token', testToken)
        .send(commentData)
        .expect(201);

      expect(response.body).toHaveProperty('content', commentData.content);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(testUser.username);
    });

    test('GET /api/gestures/:id/comments - Récupérer les commentaires', async () => {
      // Ajouter quelques commentaires
      await testGesture.addComment(testUser._id, 'Commentaire 1');
      await testGesture.addComment(testUser._id, 'Commentaire 2');

      const response = await request(app)
        .get(`/api/gestures/${testGesture._id}/comments`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe('👍 Likes', () => {
    beforeEach(async () => {
      testGesture = await createTestGesture(Gesture, testUser._id);
    });

    test('POST /api/gestures/:id/like - Liker un geste', async () => {
      const response = await request(app)
        .post(`/api/gestures/${testGesture._id}/like`)
        .set('x-auth-token', testToken)
        .expect(200);

      expect(response.body).toHaveProperty('likes', 1);
      expect(response.body).toHaveProperty('userLiked', true);
    });

    test('POST /api/gestures/:id/like - Unliker un geste', async () => {
      // D'abord liker
      await request(app)
        .post(`/api/gestures/${testGesture._id}/like`)
        .set('x-auth-token', testToken);

      // Puis unliker
      const response = await request(app)
        .post(`/api/gestures/${testGesture._id}/like`)
        .set('x-auth-token', testToken)
        .expect(200);

      expect(response.body).toHaveProperty('likes', 0);
      expect(response.body).toHaveProperty('userLiked', false);
    });

    test('GET /api/gestures/:id/likes - Récupérer les likes', async () => {
      // Ajouter un like
      await testGesture.toggleLike(testUser._id);

      const response = await request(app)
        .get(`/api/gestures/${testGesture._id}/likes`)
        .set('x-auth-token', testToken)
        .expect(200);

      expect(response.body).toHaveProperty('likes', 1);
      expect(response.body).toHaveProperty('userLiked', true);
    });
  });

  describe('📊 Statistiques', () => {
    beforeEach(async () => {
      // Créer plusieurs gestes de test
      await createTestGesture(Gesture, testUser._id, { 
        name: 'Geste 1', 
        co2Saved: 5,
        category: 'Transport'
      });
      await createTestGesture(Gesture, testUser._id, { 
        name: 'Geste 2', 
        co2Saved: 3,
        category: 'Énergie'
      });
      await createTestGesture(Gesture, testUser._id, { 
        name: 'Geste 3', 
        co2Saved: 2,
        category: 'Transport'
      });
    });

    test('GET /api/statistics - Récupérer les statistiques', async () => {
      const response = await request(app)
        .get('/api/statistics')
        .expect(200);

      expect(response.body).toHaveProperty('totalGestures', 3);
      expect(response.body).toHaveProperty('totalCO2', 10);
      expect(response.body).toHaveProperty('averageCO2', 10/3);
      expect(response.body).toHaveProperty('categoryStats');
      expect(response.body).toHaveProperty('topGestures');
      
      // Vérifier les statistiques par catégorie
      expect(response.body.categoryStats.Transport).toBe(2);
      expect(response.body.categoryStats.Énergie).toBe(1);
      
      // Vérifier le top des gestes
      expect(response.body.topGestures.length).toBe(3);
      expect(response.body.topGestures[0].co2Saved).toBe(5);
    });
  });

  describe('📤 Export', () => {
    beforeEach(async () => {
      testGesture = await createTestGesture(Gesture, testUser._id);
    });

    test('POST /api/export/pdf - Exporter en PDF', async () => {
      const exportData = {
        gestures: [testGesture.toObject()],
        filters: {}
      };

      const response = await request(app)
        .post('/api/export/pdf')
        .set('x-auth-token', testToken)
        .send(exportData)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
    });

    test('POST /api/export/excel - Exporter en Excel', async () => {
      const exportData = {
        gestures: [testGesture.toObject()],
        filters: {}
      };

      const response = await request(app)
        .post('/api/export/excel')
        .set('x-auth-token', testToken)
        .send(exportData)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(response.headers['content-disposition']).toContain('attachment');
    });
  });

  describe('🔔 Notifications', () => {
    test('GET /api/health - Vérifier la santé de l\'API', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('🚫 Gestion des erreurs', () => {
    test('GET /api/gestures/invalid-id - Geste inexistant', async () => {
      const response = await request(app)
        .get('/api/gestures/invalid-id')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    test('POST /api/gestures - Sans authentification', async () => {
      const response = await request(app)
        .post('/api/gestures')
        .send({ name: 'Test' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('GET /api/nonexistent - Route inexistante', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('🔒 Sécurité', () => {
    test('POST /api/users/register - Email déjà utilisé', async () => {
      // Créer un premier utilisateur
      await createTestUser(User, { email: 'duplicate@example.com' });

      // Essayer de créer un second utilisateur avec le même email
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'duplicate',
          email: 'duplicate@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('POST /api/users/login - Identifiants incorrects', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});

console.log('🧪 Tests d\'intégration configurés avec succès'); 