const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('../middleware/auth');
const authorizationMiddleware = require('../middleware/authorization');

const router = express.Router();

// Service URLs from environment variables
const BRIEF_SERVICE_URL = process.env.BRIEF_SERVICE_URL || 'http://localhost:3002';
const APPRENANT_SERVICE_URL = process.env.APPRENANT_SERVICE_URL || 'http://localhost:3003';
const FORMATEUR_SERVICE_URL = process.env.FORMATEUR_SERVICE_URL || 'http://localhost:3004';

// Brief service routes (accessible by all authenticated users)
router.use('/briefs', 
  authMiddleware,
  createProxyMiddleware({
    target: BRIEF_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/briefs': '/api/briefs'
    },
    onError: (err, req, res) => {
      console.error('Brief service proxy error:', err);
      res.status(503).json({
        success: false,
        message: 'Brief service unavailable'
      });
    }
  })
);

// Apprenant service routes (accessible by ADMIN and FORMATEUR)
router.use('/apprenants',
  authMiddleware,
  authorizationMiddleware(['ADMIN', 'FORMATEUR']),
  createProxyMiddleware({
    target: APPRENANT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/apprenants': '/api/apprenants'
    },
    onError: (err, req, res) => {
      console.error('Apprenant service proxy error:', err);
      res.status(503).json({
        success: false,
        message: 'Apprenant service unavailable'
      });
    }
  })
);

// Formateur service routes (accessible by ADMIN only)
router.use('/formateurs',
  authMiddleware,
  authorizationMiddleware(['ADMIN']),
  createProxyMiddleware({
    target: FORMATEUR_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/formateurs': '/api/formateurs'
    },
    onError: (err, req, res) => {
      console.error('Formateur service proxy error:', err);
      res.status(503).json({
        success: false,
        message: 'Formateur service unavailable'
      });
    }
  })
);

// Admin routes (accessible by ADMIN only)
router.use('/admin',
  authMiddleware,
  authorizationMiddleware(['ADMIN']),
  (req, res) => {
    res.json({
      success: true,
      message: 'Admin endpoint accessed successfully',
      user: req.user
    });
  }
);

module.exports = router;