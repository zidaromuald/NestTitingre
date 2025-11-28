# 🔐 Guide d'Authentification JWT - Messagerie Titingre

## ✅ Mise à Jour Terminée

Les contrôleurs de messagerie ont été mis à jour pour utiliser l'authentification JWT réelle au lieu des valeurs mockées.

---

## 🎯 Changements Effectués

### Avant (avec mocks)
```typescript
@Get()
async getMyConversations() {
  const mockUserId = 1; // TODO: JWT
  const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT

  const conversations = await this.conversationService
    .getConversationsForParticipant(mockUserId, mockUserType);
  // ...
}
```

### Après (avec JWT réel)
```typescript
@UseGuards(JwtAuthGuard)
@Get()
async getMyConversations(@CurrentUser() currentUser: User | Societe) {
  const userId = currentUser.id;
  const userType = currentUser instanceof User ? 'User' : 'Societe';

  const conversations = await this.conversationService
    .getConversationsForParticipant(userId, userType);
  // ...
}
```

---

## 📋 Fichiers Modifiés

### 1. ConversationController
**Fichier** : [conversation.controller.ts](../src/modules/messages/controllers/conversation.controller.ts)

**Modifications** :
- ✅ Ajout de `@UseGuards(JwtAuthGuard)` au niveau du contrôleur
- ✅ Ajout des imports nécessaires (JwtAuthGuard, CurrentUser, User, Societe)
- ✅ Remplacement des mocks par `@CurrentUser()` dans toutes les méthodes
- ✅ Extraction dynamique de `userId` et `userType` depuis `currentUser`

**Endpoints protégés** :
- `POST /conversations`
- `GET /conversations`
- `GET /conversations/archived`
- `GET /conversations/count`
- `GET /conversations/:id`
- `PUT /conversations/:id/archive`
- `PUT /conversations/:id/unarchive`

### 2. MessageCollaborationController
**Fichier** : [message-collaboration.controller.ts](../src/modules/messages/controllers/message-collaboration.controller.ts)

**Modifications** :
- ✅ Ajout de `@UseGuards(JwtAuthGuard)` au niveau du contrôleur
- ✅ Ajout des imports nécessaires
- ✅ Remplacement des mocks par `@CurrentUser()` dans toutes les méthodes appropriées
- ✅ Extraction dynamique de `userId` et `userType`

**Endpoints protégés** :
- `POST /messages/conversations/:conversationId`
- `GET /messages/conversations/:conversationId`
- `PUT /messages/:id/read`
- `PUT /messages/conversations/:conversationId/read-all`
- `GET /messages/unread/count`
- `GET /messages/conversations/:conversationId/unread`

**Endpoints publics** (pas d'authentification requise) :
- `GET /messages/transactions/:transactionId`
- `GET /messages/abonnements/:abonnementId`

---

## 🔑 Comment Fonctionne l'Authentification

### 1. Stratégie JWT
Le JWT contient :
```typescript
{
  sub: number,         // ID de l'utilisateur/société
  userType: 'user' | 'societe',
  iat: number,         // Date d'émission
  exp: number          // Date d'expiration
}
```

### 2. Extraction de l'Utilisateur
Le `JwtStrategy` (dans [jwt.strategy.ts](../src/modules/auth/strategies/jwt.strategy.ts)) :
- Valide le token
- Extrait le `sub` (ID) et `userType`
- Charge l'entité complète (User ou Societe) depuis la base
- Retourne l'entité qui sera disponible via `@CurrentUser()`

### 3. Utilisation dans les Contrôleurs
```typescript
async method(@CurrentUser() currentUser: User | Societe) {
  // currentUser est soit une instance de User, soit de Societe
  const userId = currentUser.id;
  const userType = currentUser instanceof User ? 'User' : 'Societe';

  // Utiliser userId et userType pour les services
}
```

---

## 🧪 Tests avec Postman

### 1. Obtenir un Token JWT

**Se connecter en tant que User** :
```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "numero": "0612345678",
  "password": "votre_password"
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

**OU se connecter en tant que Société** :
```http
POST http://localhost:3000/auth/societe/login
Content-Type: application/json

{
  "numero": "0698765432",
  "password": "votre_password"
}
```

### 2. Utiliser le Token dans les Requêtes

**Toutes les requêtes vers `/conversations` et `/messages` nécessitent maintenant le header** :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Exemples de Requêtes avec JWT

### Créer une Conversation

```http
POST http://localhost:3000/conversations
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "other_participant_id": 2,
  "other_participant_type": "User"
}
```

**Comportement** :
- Le JWT identifie automatiquement l'utilisateur connecté
- Crée une conversation entre l'utilisateur connecté et le participant spécifié

### Lister Mes Conversations

```http
GET http://localhost:3000/conversations
Authorization: Bearer YOUR_JWT_TOKEN
```

**Comportement** :
- Récupère toutes les conversations de l'utilisateur authentifié
- Pas besoin de spécifier l'ID, il est extrait du token

### Envoyer un Message

```http
POST http://localhost:3000/messages/conversations/1
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "contenu": "Bonjour ! Comment allez-vous ?",
  "type": "normal"
}
```

**Comportement** :
- Le JWT identifie l'expéditeur
- Le message est envoyé avec le bon `sender_id` et `sender_type`

### Compter Mes Messages Non Lus

```http
GET http://localhost:3000/messages/unread/count
Authorization: Bearer YOUR_JWT_TOKEN
```

**Comportement** :
- Compte uniquement les messages non lus pour l'utilisateur authentifié

---

## 🔒 Sécurité Améliorée

### Avantages de l'Authentification JWT

1. ✅ **Identification Automatique**
   - Plus besoin de passer manuellement l'ID utilisateur
   - Le backend connaît automatiquement qui fait la requête

2. ✅ **Sécurité Renforcée**
   - Impossible de se faire passer pour un autre utilisateur
   - Chaque action est liée au token JWT signé

3. ✅ **Type Polymorphique Automatique**
   - Détection automatique User vs Société
   - Pas de risque d'erreur de type

4. ✅ **Validation des Permissions**
   - L'accès aux conversations est automatiquement vérifié
   - Un utilisateur ne peut accéder qu'à ses propres conversations

---

## 🚨 Gestion des Erreurs

### Token Invalide ou Expiré
```http
Status: 401 Unauthorized

{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Token Manquant
```http
Status: 401 Unauthorized

{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Accès Refusé
```http
Status: 403 Forbidden

{
  "statusCode": 403,
  "message": "Vous n'avez pas accès à cette conversation"
}
```

---

## 📊 Comparaison Avant/Après

| Aspect | Avant (Mock) | Après (JWT) |
|--------|-------------|-------------|
| **Identification** | Hardcodé `userId = 1` | Automatique via JWT |
| **Type User** | Hardcodé `'User'` | Détection automatique |
| **Sécurité** | ❌ Aucune | ✅ Token signé |
| **Multi-utilisateurs** | ❌ Impossible | ✅ Chaque user a son token |
| **Production-ready** | ❌ Non | ✅ Oui |

---

## 🔧 Configuration Requise

### Variables d'Environnement

Assurez-vous que votre `.env` contient :
```env
JWT_SECRET=votre_secret_jwt_tres_long_et_securise
JWT_EXPIRATION=24h
```

### Module Auth

Le module d'authentification doit être correctement configuré dans `app.module.ts` :
```typescript
@Module({
  imports: [
    // ...
    AuthModule,
    // ...
  ],
})
export class AppModule {}
```

---

## ✅ Checklist de Test

Pour vérifier que tout fonctionne :

- [ ] Se connecter et obtenir un JWT
- [ ] Créer une conversation avec le JWT
- [ ] Lister ses conversations
- [ ] Envoyer un message
- [ ] Lire les messages d'une conversation
- [ ] Marquer un message comme lu
- [ ] Compter les messages non lus
- [ ] Archiver une conversation
- [ ] Vérifier qu'un utilisateur ne peut pas accéder aux conversations d'un autre

---

## 🎉 Résumé

Les contrôleurs de messagerie utilisent maintenant l'authentification JWT réelle :

1. ✅ **ConversationController** : Toutes les méthodes protégées
2. ✅ **MessageCollaborationController** : Toutes les méthodes protégées (sauf les 2 publiques)
3. ✅ **Sécurité** : Identification automatique via token
4. ✅ **Type Polymorphique** : Détection automatique User/Société
5. ✅ **Production-Ready** : Prêt pour la production

Plus de mocks, plus de `TODO: JWT` ! 🚀

---

## 📚 Fichiers Connexes

- [ConversationController](../src/modules/messages/controllers/conversation.controller.ts)
- [MessageCollaborationController](../src/modules/messages/controllers/message-collaboration.controller.ts)
- [JwtStrategy](../src/modules/auth/strategies/jwt.strategy.ts)
- [JwtAuthGuard](../src/common/guards/jwt-auth.guard.ts)
- [CurrentUser Decorator](../src/common/decorators/current-user.decorator.ts)
