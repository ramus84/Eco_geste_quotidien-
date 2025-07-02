// Configuration globale pour les tests
require('dotenv').config({ path: '.env.test' });

// Configuration de MongoDB pour les tests
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/ecoGeste_test';
process.env.JWT_SECRET = 'test_secret_key_for_testing_only';

// Configuration des timeouts
jest.setTimeout(10000);

// Mock pour les notifications push
global.Notification = {
  permission: 'granted',
  requestPermission: jest.fn().mockResolvedValue('granted')
};

// Mock pour les service workers
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    ready: Promise.resolve({
      pushManager: {
        subscribe: jest.fn(),
        getSubscription: jest.fn()
      }
    })
  },
  writable: true
});

// Configuration pour les tests d'API
global.API_BASE_URL = 'http://localhost:5000/api';

// Fonctions utilitaires pour les tests
global.createTestUser = async (User, userData = {}) => {
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    ...userData
  };
  
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(defaultUser.password, 10);
  
  return await User.create({
    ...defaultUser,
    password: hashedPassword
  });
};

global.createTestGesture = async (Gesture, userId, gestureData = {}) => {
  const defaultGesture = {
    name: 'Test Gesture',
    description: 'A test gesture for testing purposes',
    co2Saved: 2.5,
    category: 'Transport',
    userId,
    ...gestureData
  };
  
  return await Gesture.create(defaultGesture);
};

global.generateTestToken = (userId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Nettoyage après chaque test
afterEach(async () => {
  // Nettoyer la base de données après chaque test
  const mongoose = require('mongoose');
  const collections = Object.keys(mongoose.connection.collections);
  
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany({});
  }
});

// Nettoyage après tous les tests
afterAll(async () => {
  const mongoose = require('mongoose');
  await mongoose.connection.close();
});

// Configuration pour les mocks
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

jest.mock('node-cron', () => ({
  schedule: jest.fn().mockReturnValue({
    start: jest.fn(),
    stop: jest.fn()
  })
}));

// Configuration pour les tests de fichiers
jest.mock('multer', () => {
  const multer = () => {
    return {
      single: () => (req, res, next) => {
        req.file = {
          fieldname: 'image',
          originalname: 'test.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          destination: './uploads/',
          filename: 'test-123.jpg',
          path: './uploads/test-123.jpg',
          size: 12345
        };
        next();
      }
    };
  };
  
  multer.diskStorage = jest.fn();
  multer.memoryStorage = jest.fn();
  
  return multer;
});

// Configuration pour les tests PDF et Excel
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    pipe: jest.fn().mockReturnThis(),
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    end: jest.fn()
  }));
});

jest.mock('exceljs', () => ({
  Workbook: jest.fn().mockImplementation(() => ({
    addWorksheet: jest.fn().mockReturnValue({
      columns: jest.fn().mockReturnThis(),
      addRow: jest.fn().mockReturnThis()
    }),
    xlsx: {
      write: jest.fn().mockResolvedValue()
    }
  }))
}));

console.log('🧪 Configuration des tests chargée avec succès'); 