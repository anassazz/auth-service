const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to generate test token
const generateTestToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
};

describe('API Gateway', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('api-gateway');
    });
  });

  describe('Authentication Middleware', () => {
    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/briefs')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/briefs')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });

    it('should accept requests with valid token', async () => {
      const token = generateTestToken('user123', 'APPRENANT');
      
      const response = await request(app)
        .get('/api/briefs')
        .set('Authorization', `Bearer ${token}`)
        .expect(503); // Service unavailable (expected since brief service isn't running)

      expect(response.body.message).toBe('Brief service unavailable');
    });
  });

  describe('Authorization Middleware', () => {
    it('should allow ADMIN access to admin routes', async () => {
      const token = generateTestToken('admin123', 'ADMIN');
      
      const response = await request(app)
        .get('/api/admin')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('ADMIN');
    });

    it('should deny APPRENANT access to admin routes', async () => {
      const token = generateTestToken('user123', 'APPRENANT');
      
      const response = await request(app)
        .get('/api/admin')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });

    it('should allow FORMATEUR access to apprenants routes', async () => {
      const token = generateTestToken('formateur123', 'FORMATEUR');
      
      const response = await request(app)
        .get('/api/apprenants')
        .set('Authorization', `Bearer ${token}`)
        .expect(503); // Service unavailable (expected)

      expect(response.body.message).toBe('Apprenant service unavailable');
    });

    it('should deny APPRENANT access to apprenants routes', async () => {
      const token = generateTestToken('user123', 'APPRENANT');
      
      const response = await request(app)
        .get('/api/apprenants')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Route not found');
    });
  });
});