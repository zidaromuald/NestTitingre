# 🏢 Guide API Sociétés - Corrections et Utilisation

## 📋 Résumé des corrections

### ✅ Problèmes corrigés

1. **`/societes/search-by-name?q=Ola`** - Nom de colonne incorrect
2. **`/societes/autocomplete?term=Ola`** - Nom de colonne incorrect
3. **`/societes/me/stats`** - Problème de chargement de relations + authentification
4. **`/societes/:id`** - Problème de chargement de relations
5. **`/societes/:id/stats`** - Problème de chargement de relations

---

## 🔐 Authentification : User vs Societe

### ⚠️ IMPORTANT : Deux types d'utilisateurs

Votre système a **deux types d'entités** qui peuvent se connecter :

1. **User** (Utilisateur individuel) - Table `users`
2. **Societe** (Entreprise) - Table `societes`

### 🔑 Structure du JWT Token

Quand vous vous connectez, le JWT contient :

```json
{
  "sub": 1,              // ID de l'utilisateur ou de la société
  "userType": "user",    // ou "societe"
  "iat": 1730000000,
  "exp": 1730086400
}
```

### 🚫 Erreur commune

**Vous essayez d'accéder aux routes `/societes/me/*` avec un token User !**

```
GET /societes/me/stats
Authorization: Bearer <TOKEN_USER>   ❌ ERREUR !

Réponse: 403 Forbidden
{
  "statusCode": 403,
  "message": "Cette route est réservée aux sociétés"
}
```

---

## 🛠️ Solution : Se connecter en tant que Société

### Étape 1 : Créer une société (si pas encore fait)

```http
POST http://localhost:3000/auth/register/societe
Content-Type: application/json

{
  "nom_societe": "TechCorp SA",
  "numero": "+33987654321",
  "email": "contact@techcorp.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "secteur_activite": "Technologie",
  "type_produit": "Logiciels",
  "centre_interet": "IA, Cloud",
  "adresse": "Paris, France"
}
```

### Étape 2 : Se connecter en tant que Société

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "identifier": "contact@techcorp.com",  // ou "+33987654321"
  "password": "SecurePass123!"
}
```

**Réponse** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJUeXBlIjoic29jaWV0ZSIsImlhdCI6MTczMDAwMDAwMH0.xxx",
  "user": {
    "id": 1,
    "nom_societe": "TechCorp SA",
    "email": "contact@techcorp.com",
    "userType": "societe"   // ← Important !
  }
}
```

### Étape 3 : Utiliser le token Société

Maintenant vous pouvez accéder aux routes `/societes/me/*` :

```http
GET http://localhost:3000/societes/me/stats
Authorization: Bearer <TOKEN_SOCIETE>   ✅ CORRECT !
```

---

## 📍 Routes et leur authentification requise

### Routes publiques (authentification User OU Societe)

| Méthode | Route | Auth requise | Description |
|---------|-------|-------------|-------------|
| GET | `/societes/search` | User ou Societe | Rechercher des sociétés |
| GET | `/societes/search-by-name` | User ou Societe | Recherche rapide par nom |
| GET | `/societes/autocomplete` | User ou Societe | Autocomplétion |
| GET | `/societes/advanced-search` | User ou Societe | Recherche avancée |
| GET | `/societes/filters` | User ou Societe | Filtres disponibles |
| GET | `/societes/:id` | User ou Societe | Profil d'une société |
| GET | `/societes/:id/stats` | User ou Societe | Stats d'une société |

### Routes privées (authentification Societe UNIQUEMENT)

| Méthode | Route | Auth requise | Description |
|---------|-------|-------------|-------------|
| GET | `/societes/me` | **Societe** ⚠️ | Mon profil société |
| GET | `/societes/me/stats` | **Societe** ⚠️ | Mes statistiques |
| PUT | `/societes/me/profile` | **Societe** ⚠️ | Mettre à jour mon profil |
| POST | `/societes/me/logo` | **Societe** ⚠️ | Uploader mon logo |

---

## 🧪 Exemples de tests

### ✅ Test 1 : Recherche par nom (avec token User ou Societe)

```http
GET http://localhost:3000/societes/search-by-name?q=Tech
Authorization: Bearer <N_IMPORTE_QUEL_TOKEN>
```

**Réponse attendue** :
```json
{
  "message": "Recherche effectuée avec succès",
  "data": [
    {
      "id": 1,
      "nom_societe": "TechCorp SA",
      "secteur_activite": "Technologie",
      "adresse": "Paris, France"
    }
  ]
}
```

### ✅ Test 2 : Autocomplétion (avec token User ou Societe)

```http
GET http://localhost:3000/societes/autocomplete?term=Tech
Authorization: Bearer <N_IMPORTE_QUEL_TOKEN>
```

**Réponse attendue** :
```json
{
  "message": "Autocomplétion effectuée avec succès",
  "data": [
    {
      "id": 1,
      "nom_societe": "TechCorp SA",
      "secteur_activite": "Technologie",
      "type_produit": "Logiciels"
    }
  ]
}
```

### ✅ Test 3 : Mes statistiques (avec token Societe UNIQUEMENT)

```http
GET http://localhost:3000/societes/me/stats
Authorization: Bearer <TOKEN_SOCIETE>
```

**Réponse attendue** :
```json
{
  "success": true,
  "data": {
    "postsCount": 0,
    "followersCount": 0,
    "followingCount": 0,
    "membresCount": 5,        // Nombre d'employés
    "groupesCount": 2,        // Groupes créés par la société
    "profileCompletude": 80   // Score de complétude du profil (0-100%)
  }
}
```

### ✅ Test 4 : Profil d'une société par ID (avec n'importe quel token)

```http
GET http://localhost:3000/societes/1
Authorization: Bearer <N_IMPORTE_QUEL_TOKEN>
```

**Réponse attendue** :
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom_societe": "TechCorp SA",
    "email": "contact@techcorp.com",
    "secteur_activite": "Technologie",
    "profile": {
      "logo": "uploads/images/techcorp-logo.png",
      "description": "Leader en solutions IA",
      "nombre_employes": 50,
      "chiffre_affaires": 5000000
    }
  }
}
```

---

## ❌ Erreurs communes et solutions

### Erreur 1 : "Cette route est réservée aux sociétés"

```json
{
  "statusCode": 403,
  "message": "Cette route est réservée aux sociétés"
}
```

**Cause** : Vous utilisez un token User pour accéder à une route `/societes/me/*`

**Solution** :
1. Connectez-vous en tant que Société
2. Utilisez le token de la réponse pour accéder aux routes

---

### Erreur 2 : "Internal server error" sur search-by-name

**Cause** : Bug dans le code (colonne inexistante) - **DÉJÀ CORRIGÉ** ✅

**Solution** : Les corrections ont été appliquées automatiquement

---

### Erreur 3 : "Société introuvable"

```json
{
  "statusCode": 404,
  "message": "Société introuvable"
}
```

**Cause** : L'ID de la société n'existe pas

**Solution** : Vérifiez que l'ID existe dans la base de données

---

## 🔍 Vérifier le type de votre token

Pour savoir quel type de token vous avez, décodez-le sur [jwt.io](https://jwt.io) :

```json
{
  "sub": 1,
  "userType": "user"    // ← "user" ou "societe"
}
```

---

## 📊 Statistiques expliquées

| Champ | Description | Source |
|-------|-------------|--------|
| `postsCount` | Nombre de posts | TODO (à implémenter) |
| `followersCount` | Abonnés | TODO (à implémenter) |
| `followingCount` | Abonnements | TODO (à implémenter) |
| `membresCount` | Employés/Membres | Table `societe_users` |
| `groupesCount` | Groupes créés | Table `groupes` (created_by_type='Societe') |
| `profileCompletude` | Score profil | Calculé (logo, description, etc.) |

---

## 🎯 Checklist de test

- [ ] Créer une société via `/auth/register/societe`
- [ ] Se connecter en tant que société via `/auth/login`
- [ ] Copier le `access_token` de la réponse
- [ ] Tester `/societes/me/stats` avec ce token
- [ ] Tester `/societes/search-by-name?q=...`
- [ ] Tester `/societes/autocomplete?term=...`
- [ ] Tester `/societes/:id` avec un ID valide
- [ ] Tester `/societes/:id/stats` avec un ID valide

---

## 💡 Astuce : Postman

Dans Postman, créez deux environnements :

### Environnement "User"
```
base_url: http://localhost:3000
token: <TOKEN_USER>
user_type: user
```

### Environnement "Societe"
```
base_url: http://localhost:3000
token: <TOKEN_SOCIETE>
user_type: societe
```

Basculez entre les environnements selon le type de route à tester !

---

Tous les problèmes sont maintenant corrigés ! 🎉
