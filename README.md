# Microservices Auth-Service & API Gateway

Une architecture microservices sécurisée avec service d'authentification JWT et API Gateway pour l'entreprise 404.js.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Web    │───▶│  API Gateway    │───▶│  Auth Service   │
│                 │    │   (Port 3000)   │    │   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Brief Service   │    │    MongoDB      │
                       │  (Port 3002)    │    │   (Port 27017)  │
                       └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │Apprenant Service│
                       │  (Port 3003)    │
                       └─────────────────┘
```

## 🚀 Démarrage Rapide

### Avec Docker (Recommandé)

```bash
# Cloner le projet
git clone <repository-url>
cd microservices-auth-system

# Lancer tous les services
npm run docker:up

# Arrêter tous les services
npm run docker:down
```

### Développement Local

```bash
# Installer les dépendances
cd auth-service && npm install
cd ../api-gateway && npm install

# Démarrer MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:6.0

# Démarrer les services en mode développement
npm run dev:auth    # Terminal 1
npm run dev:gateway # Terminal 2
```

## 🔐 Auth-Service (Port 3001)

### Fonctionnalités

- **Enregistrement d'utilisateurs** avec validation des données
- **Authentification JWT** avec tokens signés
- **Gestion des rôles** : APPRENANT, ADMIN, FORMATEUR
- **Stockage MongoDB** avec Mongoose
- **Validation robuste** avec express-validator
- **Sécurité** : hash des mots de passe, protection contre les attaques

### API Endpoints

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "APPRENANT"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

```http
POST /api/auth/verify-token
Authorization: Bearer <jwt-token>
```

### Validation des Données

- **Email** : Format valide et unique
- **Mot de passe** : Minimum 6 caractères, au moins une majuscule, une minuscule et un chiffre
- **Nom/Prénom** : Entre 2 et 50 caractères
- **Rôle** : APPRENANT, ADMIN, ou FORMATEUR

## 🌐 API Gateway (Port 3000)

### Fonctionnalités

- **Point d'entrée unique** pour toutes les requêtes
- **Authentification JWT** automatique
- **Autorisation basée sur les rôles** (RBAC)
- **Reverse proxy** intelligent vers les microservices
- **Rate limiting** et protection DDoS
- **Logging** et monitoring des requêtes

### Routes Protégées

```http
# Accès public
POST /api/auth/register
POST /api/auth/login

# Accès authentifié
GET /api/briefs          # Tous les utilisateurs connectés
GET /api/apprenants      # Tous les utilisateurs connectés

# Accès ADMIN/FORMATEUR uniquement
POST /api/briefs         # Créer un brief
PUT /api/briefs/:id      # Modifier un brief
DELETE /api/briefs/:id   # Supprimer un brief

# Accès ADMIN uniquement
GET /api/admin/*         # Routes d'administration
```

### Middleware de Sécurité

1. **Rate Limiting** : 100 requêtes/15 minutes par IP
2. **Helmet** : Protection contre les vulnérabilités web
3. **CORS** : Configuration cross-origin
4. **JWT Verification** : Validation des tokens
5. **Role Authorization** : Contrôle d'accès basé sur les rôles

## 🗄️ Base de Données

### Modèle Utilisateur

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  role: String (enum: ['APPRENANT', 'ADMIN', 'FORMATEUR']),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔑 Sécurité

### JWT Configuration

- **Secret Key** : Configuré via variables d'environnement
- **Expiration** : 24 heures par défaut
- **Algorithme** : HS256
- **Payload** : ID utilisateur, email, rôle

### Hachage des Mots de Passe

- **Algorithme** : bcrypt
- **Salt Rounds** : 12
- **Validation** : Comparaison sécurisée

### Variables d'Environnement

```env
# Auth Service
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/auth_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=24h

# API Gateway
NODE_ENV=development
PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
BRIEF_SERVICE_URL=http://localhost:3002
APPRENANT_SERVICE_URL=http://localhost:3003
```

## 🧪 Tests

### Exécution des Tests

```bash
# Tests Auth Service
cd auth-service
npm test

# Tests API Gateway
cd api-gateway
npm test

# Tests complets
npm run test
```

### Couverture des Tests

- **Auth Service** : Enregistrement, connexion, vérification de token
- **API Gateway** : Health check, authentification, autorisation
- **Intégration** : Communication entre services

## 📊 Monitoring

### Health Checks

```http
GET /health
```

Response:
```json
{
  "status": "UP",
  "service": "Auth-Service",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "uptime": 123.45
}
```

### Logs

- **Morgan** : Logging des requêtes HTTP
- **Console** : Erreurs et événements importants
- **Structured Logging** : Format JSON pour faciliter l'analyse

## 🚀 Déploiement

### Production

```bash
# Build et déploiement
npm run docker:build
npm run docker:up

# Vérification
curl http://localhost:3000/health
curl http://localhost:3001/health
```

### Environnements

- **Development** : Hot reload, logging détaillé
- **Production** : Optimisations, logging minimal, sécurité renforcée

## 🔧 Configuration

### Services Externes

Le gateway peut être configuré pour router vers d'autres microservices :

```javascript
const services = {
  briefs: {
    target: 'http://brief-service:3002',
    pathRewrite: { '^/api/briefs': '/api/briefs' }
  },
  apprenants: {
    target: 'http://apprenant-service:3003',
    pathRewrite: { '^/api/apprenants': '/api/apprenants' }
  }
};
```

### Extensibilité

- **Nouveaux services** : Ajout facile de routes dans le gateway
- **Nouveaux rôles** : Extension du système d'autorisation
- **Middleware personnalisé** : Ajout de fonctionnalités spécifiques

## 📋 Gestion des Erreurs

### Codes d'Erreur Standardisés

```javascript
// Auth Service
DUPLICATE_USER         // Utilisateur déjà existant
INVALID_CREDENTIALS    // Identifiants incorrects
VALIDATION_ERROR       // Erreurs de validation
TOKEN_EXPIRED          // Token expiré
INVALID_TOKEN          // Token invalide

// API Gateway
NO_AUTH_HEADER         // En-tête d'autorisation manquant
NO_TOKEN              // Token manquant
INSUFFICIENT_PERMISSIONS // Permissions insuffisantes
SERVICE_UNAVAILABLE   // Service indisponible
RATE_LIMIT_EXCEEDED   // Limite de taux dépassée
```

## 🤝 Contribution

1. **Fork** le projet
2. **Branch** pour votre feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branch (`git push origin feature/AmazingFeature`)
5. **Pull Request**

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- **Issues** : Créer une issue GitHub
- **Documentation** : Consulter cette README
- **Tests** : Vérifier les tests unitaires pour des exemples d'usage