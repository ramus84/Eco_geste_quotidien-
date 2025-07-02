module.exports = {
  // Environnement de test
  testEnvironment: 'node',
  
  // Dossiers à ignorer lors des tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/eco-gestes-frontend/',
    '/uploads/',
    '/public/'
  ],
  
  // Fichiers de test à inclure
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Collecte de la couverture de code
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/eco-gestes-frontend/**',
    '!**/tests/**',
    '!**/jest.config.js',
    '!**/app.js'
  ],
  
  // Répertoires de couverture
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Seuils de couverture
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Variables d'environnement pour les tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Timeout pour les tests
  testTimeout: 10000,
  
  // Verbosité
  verbose: true,
  
  // Nettoyage automatique
  clearMocks: true,
  resetMocks: true,
  
  // Configuration pour les modules
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  
  // Extensions de fichiers
  moduleFileExtensions: ['js', 'json'],
  
  // Transformations
  transform: {},
  
  // Configuration pour les tests d'intégration
  testEnvironmentOptions: {
    url: 'http://localhost:5000'
  }
}; 