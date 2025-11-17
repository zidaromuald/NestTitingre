# 🔍 Diagnostic des erreurs Sociétés

## Étape 1 : Vérifier que vous avez bien une société dans la base

### Option A : Via Postman

```http
POST http://localhost:3000/auth/register/societe
Content-Type: application/json

{
  "nom_societe": "Test Société",
  "numero": "+33999888777",
  "email": "test.societe@example.com",
  "password": "Password123!",
  "password_confirmation": "Password123!",
  "secteur_activite": "Technologie",
  "type_produit": "Services",
  "centre_interet": "Innovation",
  "adresse": "Paris, France"
}
```

**Réponse attendue** :
```json
{
  "message": "Société enregistrée avec succès",
  "user": {
    "id": 1,
    "nom_societe": "Test Société",
    "email": "test.societe@example.com",
    "numero": "+33999888777"
  }
}
```

**Notez l'ID** (par exemple : `1`)

---

## Étape 2 : Se connecter en tant que société

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "identifier": "test.societe@example.com",
  "password": "Password123!"
}
```

**Réponse attendue** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nom_societe": "Test Société",
    "userType": "societe"   // ← Vérifiez que c'est "societe" !
  }
}
```

**⚠️ IMPORTANT** : Copiez le `access_token` complet !

---

## Étape 3 : Vérifier le token sur jwt.io

1. Allez sur https://jwt.io
2. Collez votre token
3. Vérifiez le payload :

```json
{
  "sub": 1,
  "userType": "societe",   // ← Doit être "societe", PAS "user" !
  "iat": 1730000000,
  "exp": 1730086400
}
```

Si `userType` est "user", vous utilisez le **mauvais token** !

---

## Étape 4 : Tester les endpoints

### Test A : GET /societes/me/stats

```http
GET http://localhost:3000/societes/me/stats
Authorization: Bearer <VOTRE_TOKEN_SOCIETE>
```

#### Cas 1 : Token User (❌ Erreur attendue)

**Réponse** :
```json
{
  "statusCode": 403,
  "message": "Cette route est réservée aux sociétés. Votre type: user"
}
```

**Solution** : Utilisez un token Société, pas User !

---

#### Cas 2 : Token Société mais ID n'existe pas (❌ Erreur)

**Réponse** :
```json
{
  "statusCode": 404,
  "message": "Société introuvable"
}
```

**Solution** : Le token contient un ID qui n'existe plus en base. Créez une nouvelle société.

---

#### Cas 3 : Token Société valide (✅ Succès)

**Réponse** :
```json
{
  "success": true,
  "data": {
    "postsCount": 0,
    "followersCount": 0,
    "followingCount": 0,
    "membresCount": 0,
    "groupesCount": 0,
    "profileCompletude": 0
  }
}
```

---

### Test B : GET /societes/me

```http
GET http://localhost:3000/societes/me
Authorization: Bearer <VOTRE_TOKEN_SOCIETE>
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Profil récupéré avec succès",
  "data": {
    "id": 1,
    "nom_societe": "Test Société",
    "email": "test.societe@example.com",
    "numero": "+33999888777",
    "secteur_activite": "Technologie",
    "type_produit": "Services",
    "centre_interet": "Innovation",
    "adresse": "Paris, France",
    "email_verified_at": null,
    "created_at": "2024-11-15T10:00:00.000Z",
    "updated_at": "2024-11-15T10:00:00.000Z",
    "profile": {
      "id": 1,
      "societe_id": 1,
      "logo": null,
      "secteur_activite": null,
      "description": null,
      "taille_entreprise": null,
      "nombre_employes": null,
      "chiffre_affaires": null,
      "annee_creation": null,
      "certifications": [],
      "adresse_complete": null,
      "ville": null,
      "pays": null,
      "code_postal": null,
      "telephone": null,
      "email_contact": null,
      "created_at": "2024-11-15T10:00:00.000Z",
      "updated_at": "2024-11-15T10:00:00.000Z"
    }
  }
}
```

---

### Test C : GET /societes/:id (avec n'importe quel token)

```http
GET http://localhost:3000/societes/1
Authorization: Bearer <N_IMPORTE_QUEL_TOKEN>
```

**Réponse attendue** : Même structure que `/societes/me`

---

### Test D : GET /societes/search-by-name

```http
GET http://localhost:3000/societes/search-by-name?q=Test
Authorization: Bearer <N_IMPORTE_QUEL_TOKEN>
```

**Réponse attendue** :
```json
{
  "message": "Recherche effectuée avec succès",
  "data": [
    {
      "id": 1,
      "nom_societe": "Test Société",
      "secteur_activite": "Technologie",
      "adresse": "Paris, France"
    }
  ]
}
```

---

## Erreurs communes et solutions

### ❌ "Internal server error"

**Causes possibles** :

1. **Token invalide ou expiré**
   - Solution : Reconnectez-vous pour obtenir un nouveau token

2. **ID de société n'existe pas**
   - Solution : Créez une nouvelle société et utilisez son token

3. **Problème de base de données**
   - Solution : Vérifiez que les tables existent (`societes`, `societe_profils`, etc.)

4. **Erreur dans le code**
   - Solution : Vérifiez les logs du serveur NestJS dans la console

---

### ❌ "Cette route est réservée aux sociétés"

**Cause** : Vous utilisez un token User

**Solution** :
1. Décodez votre token sur jwt.io
2. Vérifiez `userType`
3. Si c'est "user", connectez-vous en tant que société

---

### ❌ "Société introuvable" (404)

**Cause** : L'ID dans le token ne correspond à aucune société en base

**Solutions** :
1. Créez une nouvelle société
2. Utilisez le nouveau token obtenu

---

## Checklist de diagnostic

- [ ] J'ai créé une société via `/auth/register/societe`
- [ ] J'ai reçu un `id` dans la réponse
- [ ] Je me suis connecté via `/auth/login` avec les identifiants de la société
- [ ] J'ai copié le `access_token`
- [ ] J'ai vérifié sur jwt.io que `userType` est bien "societe"
- [ ] J'utilise ce token dans le header `Authorization: Bearer <token>`
- [ ] J'ai testé `/societes/me/stats` avec ce token
- [ ] Si erreur, j'ai vérifié les logs du serveur dans la console

---

## Debug : Voir les logs du serveur

Dans votre terminal où `npm run start:dev` tourne, regardez les erreurs :

```
[Nest] ERROR [ExceptionsHandler] <Message d'erreur>
Error: <Détails>
    at SocieteService.getProfileStats (...
```

Envoyez-moi ces logs pour que je puisse vous aider !

---

## Commandes utiles

### Vérifier qu'une société existe en base

```sql
SELECT id, nom_societe, email FROM societes;
```

### Vérifier le profil d'une société

```sql
SELECT * FROM societe_profils WHERE societe_id = 1;
```

### Compter les membres d'une société

```sql
SELECT COUNT(*) FROM societe_users WHERE societe_id = 1;
```

---

**Si vous avez toujours "Internal server error", envoyez-moi :**
1. Le payload de votre token (décodé sur jwt.io)
2. Les logs du serveur (console où tourne `npm run start:dev`)
3. L'ID de la société que vous essayez d'accéder
