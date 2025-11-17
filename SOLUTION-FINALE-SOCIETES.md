# 🔧 Solution Finale - Corriger les erreurs Sociétés

## 🎯 Problème identifié

L'erreur était :
```
error: la colonne Societe__Societe_profile.logo n'existe pas
```

**Cause** : La table `societe_profils` en base de données ne correspond pas à l'entité `SocieteProfil` du code.

### Colonnes dans la base (migration initiale)
- ❌ `photo_couverture`
- ❌ `presentation_longue`
- ❌ `reseaux_sociaux`
- ❌ `horaires_ouverture`

### Colonnes dans l'entité (code)
- ✅ `logo`
- ✅ `description`
- ✅ `secteur_activite`
- ✅ `taille_entreprise`
- ✅ `chiffre_affaires`
- ✅ Et bien d'autres...

---

## 🛠️ Solution : Mettre à jour la table

### Option 1 : Script SQL (RECOMMANDÉ)

1. **Ouvrez votre client PostgreSQL** (pgAdmin, DBeaver, ou ligne de commande)

2. **Exécutez le script** `fix-societe-profils-table.sql` :

```bash
# Depuis la ligne de commande PostgreSQL
psql -U votre_user -d votre_database -f fix-societe-profils-table.sql

# OU copiez-collez le contenu du fichier dans votre client SQL
```

3. **Redémarrez le serveur NestJS**
   ```bash
   # Arrêtez (Ctrl+C) puis
   npm run start:dev
   ```

---

### Option 2 : Via migration TypeORM

Si vous préférez utiliser les migrations TypeORM :

```bash
npm run migration:run
```

**Note** : Si la commande échoue avec une erreur de connexion, utilisez l'Option 1.

---

## ✅ Vérification

Après avoir exécuté le script SQL, testez :

### Test 1 : GET /societes/me/stats

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
    "membresCount": 0,
    "groupesCount": 0,
    "profileCompletude": 0
  }
}
```

---

### Test 2 : GET /societes/me

```http
GET http://localhost:3000/societes/me
Authorization: Bearer <TOKEN_SOCIETE>
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Profil récupéré avec succès",
  "data": {
    "id": 1,
    "nom_societe": "Ma Société",
    "email": "societe@example.com",
    "numero": "+33123456789",
    "secteur_activite": "Technologie",
    "type_produit": "Services",
    "centre_interet": "Innovation",
    "adresse": "Paris",
    "email_verified_at": null,
    "created_at": "2024-11-15T10:00:00.000Z",
    "updated_at": "2024-11-15T10:00:00.000Z",
    "profile": {
      "id": 1,
      "societe_id": 1,
      "logo": null,
      "description": null,
      "secteur_activite": null,
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

### Test 3 : GET /societes/search-by-name

```http
GET http://localhost:3000/societes/search-by-name?q=Ma
Authorization: Bearer <N_IMPORTE_QUEL_TOKEN>
```

**Réponse attendue** :
```json
{
  "message": "Recherche effectuée avec succès",
  "data": [
    {
      "id": 1,
      "nom_societe": "Ma Société",
      "secteur_activite": "Technologie",
      "adresse": "Paris"
    }
  ]
}
```

---

### Test 4 : GET /societes/autocomplete

```http
GET http://localhost:3000/societes/autocomplete?term=Ma
Authorization: Bearer <N_IMPORTE_QUEL_TOKEN>
```

**Réponse attendue** :
```json
{
  "message": "Autocomplétion effectuée avec succès",
  "data": [
    {
      "id": 1,
      "nom_societe": "Ma Société",
      "secteur_activite": "Technologie",
      "type_produit": "Services"
    }
  ]
}
```

---

## 📊 Mettre à jour le profil

Maintenant que la table est corrigée, vous pouvez mettre à jour le profil :

```http
PUT http://localhost:3000/societes/me/profile
Authorization: Bearer <TOKEN_SOCIETE>
Content-Type: application/json

{
  "description": "Leader en solutions technologiques innovantes",
  "secteur_activite": "Technologies de l'information",
  "taille_entreprise": "PME",
  "nombre_employes": 50,
  "chiffre_affaires": 5000000,
  "annee_creation": 2020,
  "certifications": ["ISO 9001", "ISO 27001"],
  "adresse_complete": "123 Avenue des Champs-Élysées",
  "ville": "Paris",
  "pays": "France",
  "code_postal": "75008",
  "telephone": "+33 1 23 45 67 89",
  "email_contact": "contact@masociete.fr"
}
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "data": {
    "id": 1,
    "societe_id": 1,
    "logo": null,
    "description": "Leader en solutions technologiques innovantes",
    "secteur_activite": "Technologies de l'information",
    "taille_entreprise": "PME",
    "nombre_employes": 50,
    "chiffre_affaires": "5000000.00",
    "annee_creation": 2020,
    "certifications": ["ISO 9001", "ISO 27001"],
    "adresse_complete": "123 Avenue des Champs-Élysées",
    "ville": "Paris",
    "pays": "France",
    "code_postal": "75008",
    "telephone": "+33 1 23 45 67 89",
    "email_contact": "contact@masociete.fr",
    "created_at": "2024-11-15T10:00:00.000Z",
    "updated_at": "2024-11-15T10:05:00.000Z"
  }
}
```

---

## 🎉 Récapitulatif des corrections

### Bugs corrigés dans le code

1. ✅ `societe.societe` → `societe.nom_societe` dans searchByName
2. ✅ `societe.societe` → `societe.nom_societe` dans autocomplete
3. ✅ Suppression du chargement de la relation `membres` (causait des erreurs)
4. ✅ Utilisation de requêtes SQL manuelles pour compter les membres et groupes
5. ✅ Ajout du `UserTypeGuard` pour protéger les routes `/me/*`
6. ✅ Messages d'erreur clairs si mauvais type de token

### Structure de base de données corrigée

1. ✅ `photo_couverture` → `logo`
2. ✅ `presentation_longue` → `description`
3. ✅ Ajout de toutes les colonnes manquantes
4. ✅ Suppression des colonnes obsolètes

---

## 🔍 Logs de debug

Les logs de debug sont activés dans le code. Quand vous testez, vous devriez voir :

```
🔍 CurrentUser dans me/stats: {
  id: 1,
  userType: 'societe',
  nom_societe: 'Ma Société',
  type: 'object'
}
🔍 getProfileStats appelé avec societeId: 1
🔍 Société trouvée: {
  id: 1,
  nom_societe: 'Ma Société',
  hasProfile: true
}
```

Si vous voyez `userType: 'user'`, c'est que vous utilisez un token User au lieu d'un token Société !

---

## ❓ FAQ

### Q: J'ai toujours "Internal server error"
**R:** Exécutez d'abord le script SQL `fix-societe-profils-table.sql` pour corriger la structure de la table.

### Q: "Cette route est réservée aux sociétés"
**R:** Vous utilisez un token User. Connectez-vous en tant que société avec `/auth/login` en utilisant les identifiants d'une société.

### Q: "Société introuvable"
**R:** L'ID dans votre token ne correspond à aucune société en base. Créez une nouvelle société via `/auth/register/societe`.

### Q: Comment savoir quel type de token j'utilise ?
**R:** Décodez votre token sur https://jwt.io et regardez le champ `userType`.

---

Tout devrait maintenant fonctionner parfaitement ! 🎉
