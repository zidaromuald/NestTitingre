# Guide Postman - Test de l'Upload de Photo de Profil

## 📋 Prérequis

1. Avoir Postman installé
2. Avoir un token JWT valide pour l'authentification
3. Le serveur NestJS doit être démarré (`npm run start:dev`)

## 🚀 Étape 1 : Créer une image de test

Exécutez le script pour créer des images de test :

```bash
node create-test-image.js
```

Cela créera un dossier `test-files/` avec deux images :
- `test-profile.png`
- `test-profile.jpg`

## 📝 Étape 2 : Configuration dans Postman

### 2.1 Créer une nouvelle requête

1. Ouvrez Postman
2. Cliquez sur **"New"** → **"HTTP Request"**
3. Configurez la requête :
   - **Méthode** : `POST`
   - **URL** : `http://localhost:3000/users/me/photo`

### 2.2 Configurer l'authentification

1. Allez dans l'onglet **"Authorization"**
2. Sélectionnez **"Bearer Token"** dans le menu déroulant
3. Collez votre JWT token dans le champ **"Token"**

   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTczMDAwMDAwMH0.xxxxxxxxxxxxx
   ```

### 2.3 Configurer le Body (Upload de fichier)

1. Allez dans l'onglet **"Body"**
2. Sélectionnez **"form-data"**
3. Ajoutez un nouveau champ :
   - **Key** : `file` (changez le type de "Text" à **"File"** via le menu déroulant à droite)
   - **Value** : Cliquez sur **"Select Files"** et choisissez une image
     - Soit `test-files/test-profile.jpg`
     - Soit `test-files/test-profile.png`
     - Ou n'importe quelle image de votre ordinateur

   ![Postman Form Data](https://i.imgur.com/example.png)

### 2.4 Headers (automatiquement configurés)

Postman configure automatiquement le header `Content-Type: multipart/form-data` quand vous utilisez form-data avec un fichier. **Ne le modifiez pas manuellement**.

## ▶️ Étape 3 : Envoyer la requête

1. Cliquez sur **"Send"**
2. Vérifiez la réponse

### ✅ Réponse attendue (succès - 200 OK)

```json
{
  "success": true,
  "message": "Photo de profil mise à jour avec succès",
  "data": {
    "photo": "uploads/images/1730000000000-profile.jpg",
    "url": "http://localhost:3000/uploads/images/1730000000000-profile.jpg"
  }
}
```

### ❌ Erreurs possibles

#### 1. Pas de fichier fourni (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Aucun fichier fourni",
  "error": "Bad Request"
}
```
**Solution** : Assurez-vous d'avoir sélectionné un fichier dans le champ `file`

#### 2. Non authentifié (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Solution** : Vérifiez que votre token JWT est valide et correctement configuré

#### 3. Type de fichier non supporté (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Type de fichier non supporté. Formats acceptés : jpg, jpeg, png, gif, webp",
  "error": "Bad Request"
}
```
**Solution** : Utilisez un fichier image valide (JPG, PNG, GIF, WEBP)

#### 4. Fichier trop volumineux (413 Payload Too Large)
```json
{
  "statusCode": 413,
  "message": "File too large"
}
```
**Solution** : Utilisez une image plus petite (vérifiez la limite configurée dans multer.config.ts)

## 🧪 Étape 4 : Vérifier l'upload

Après un upload réussi, vérifiez que le profil a été mis à jour :

### Requête GET pour voir le profil

- **Méthode** : `GET`
- **URL** : `http://localhost:3000/users/me`
- **Authorization** : Bearer Token (même token)

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Profil récupéré avec succès",
  "data": {
    "id": 1,
    "nom": "Doe",
    "prenom": "John",
    "email": "john@example.com",
    "numero": "+33612345678",
    "profile": {
      "id": 1,
      "user_id": 1,
      "photo": "uploads/images/1730000000000-profile.jpg",  // ← Photo mise à jour
      "bio": "Développeur passionné",
      "competences": ["JavaScript", "TypeScript"],
      "created_at": "2024-10-27T10:00:00.000Z",
      "updated_at": "2024-10-27T10:30:00.000Z"
    }
  }
}
```

## 📊 Collection Postman complète

Créez une collection Postman avec toutes les requêtes :

### Collection : User Profile Management

1. **POST** `/users/me/photo` - Upload photo de profil
2. **PUT** `/users/me/profile` - Mettre à jour le profil
3. **GET** `/users/me` - Récupérer mon profil
4. **GET** `/users/me/stats` - Récupérer mes statistiques

### Variables d'environnement

Créez un environnement "Development" avec :
- `base_url` : `http://localhost:3000`
- `token` : `votre_jwt_token_ici`

Puis utilisez `{{base_url}}/users/me/photo` dans vos requêtes.

## 🔧 Tests avancés avec Postman

### Script de test automatique (Tests tab)

Ajoutez ce script dans l'onglet "Tests" de votre requête :

```javascript
// Vérifier que le statut est 200
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Vérifier la structure de la réponse
pm.test("Response has correct structure", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData).to.have.property('message');
    pm.expect(jsonData).to.have.property('data');
    pm.expect(jsonData.data).to.have.property('photo');
    pm.expect(jsonData.data).to.have.property('url');
});

// Vérifier que l'URL de la photo est valide
pm.test("Photo URL is valid", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.url).to.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i);
});

// Temps de réponse acceptable
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

## 🎯 Cas de test à couvrir

- [ ] Upload d'une image PNG
- [ ] Upload d'une image JPG
- [ ] Upload d'une image GIF
- [ ] Upload d'une image WEBP
- [ ] Tentative d'upload sans fichier (doit échouer)
- [ ] Tentative d'upload d'un fichier PDF (doit échouer)
- [ ] Tentative d'upload sans authentification (doit échouer)
- [ ] Upload d'une image très volumineuse (doit échouer si > limite)
- [ ] Upload multiple fois pour vérifier le remplacement

## 💡 Conseils

1. **Utilisez les Collections** : Organisez vos requêtes dans des collections Postman
2. **Variables d'environnement** : Utilisez des variables pour `base_url` et `token`
3. **Tests automatiques** : Ajoutez des scripts de test pour valider les réponses
4. **Sauvegardez les exemples** : Dans Postman, sauvegardez les réponses comme "Examples" pour documentation
5. **Partagez la collection** : Exportez et partagez votre collection avec l'équipe

## 🐛 Debugging

Si l'upload ne fonctionne pas :

1. Vérifiez les logs du serveur NestJS
2. Vérifiez que le dossier `uploads/images/` existe et a les bonnes permissions
3. Vérifiez la configuration multer dans `multer.config.ts`
4. Testez avec une très petite image (comme celles créées par le script)
5. Vérifiez que MediaService est correctement configuré
