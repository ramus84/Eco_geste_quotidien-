// On importe les modules nécessaires
const request = require('supertest'); // Pour simuler des requêtes HTTP
const app = require('../app'); // On importe l'application Express

// Groupe de tests pour les gestes
describe('API Gestes écologiques', () => {
  let gestureId; // Variable pour stocker l'ID du geste créé

  // Test : ajout d'un geste
  it('doit ajouter un nouveau geste', async () => {
    const newGesture = {
      title: 'Éteindre la lumière',
      description: 'Éteindre la lumière en quittant une pièce',
      category: 'Énergie'
    };
    const response = await request(app)
      .post('/api/gestures')
      .send(newGesture)
      .expect(201); // On attend un code 201 (créé)
    // On vérifie que le titre est correct
    expect(response.body.title).toBe(newGesture.title);
    // On sauvegarde l'ID pour les tests suivants
    gestureId = response.body._id;
  });

  // Test : affichage de la liste des gestes
  it('doit retourner une liste de gestes', async () => {
    const response = await request(app)
      .get('/api/gestures')
      .expect(200); // On attend un code 200 (OK)
    // On vérifie que la réponse est un tableau
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test : modification d'un geste
  it('doit modifier un geste existant', async () => {
    const updatedGesture = {
      title: 'Éteindre la lumière modifié',
      description: 'Description modifiée',
      category: 'Énergie'
    };
    const response = await request(app)
      .put(`/api/gestures/${gestureId}`)
      .send(updatedGesture)
      .expect(200); // On attend un code 200 (OK)
    // On vérifie que le titre a changé
    expect(response.body.title).toBe(updatedGesture.title);
  });

  // Test : suppression d'un geste
  it('doit supprimer un geste existant', async () => {
    await request(app)
      .delete(`/api/gestures/${gestureId}`)
      .expect(200); // On attend un code 200 (OK)
  });

  // Test : suppression d'un geste inexistant (erreur)
  it('retourne une erreur si le geste n\'existe pas', async () => {
    await request(app)
      .delete('/api/gestures/123456789012345678901234')
      .expect(404); // On attend un code 404 (non trouvé)
  });
}); 