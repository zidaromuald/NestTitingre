# 🚀 Quick Start - Test Upload Photo avec Postman

## Étapes rapides (5 minutes)

### 1️⃣ Créer une image de test
```bash
node create-test-image.js
```

### 2️⃣ Importer la collection Postman
1. Ouvrez Postman
2. Cliquez sur **Import** (en haut à gauche)
3. Glissez-déposez le fichier `Postman-User-Profile-Collection.json`
4. Cliquez sur **Import**

### 3️⃣ Configurer vos variables
1. Dans Postman, sélectionnez la collection **"User Profile API"**
2. Allez dans l'onglet **Variables**
3. Modifiez :
   - `base_url` : `http://localhost:3000` (ou votre URL)
   - `token` : Votre JWT token (obtenu après login)

### 4️⃣ Se connecter pour obtenir un token
1. Dans la collection, ouvrez **Authentication** → **Login**
2. Modifiez le body avec vos identifiants :
   ```json
   {
     "identifier": "votre_numero_ou_email",
     "password": "votre_mot_de_passe"
   }
   ```
3. Cliquez sur **Send**
4. Copiez le `access_token` de la réponse
5. Collez-le dans la variable `token` de la collection

### 5️⃣ Tester l'upload de photo
1. Ouvrez **Profile Management** → **Upload Profile Photo**
2. Dans l'onglet **Body**, vous verrez `form-data` avec la clé `file`
3. Survolez la cellule de droite, un bouton **"Select Files"** apparaît
4. Cliquez dessus et sélectionnez `test-files/test-profile.jpg`
5. Cliquez sur **Send**

### ✅ Réponse attendue
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

---

## 📸 Configuration visuelle dans Postman

### Configuration du Body pour l'upload

```
┌─────────────────────────────────────────────────────────┐
│ Body                                                    │
├─────────────────────────────────────────────────────────┤
│ ○ none   ○ form-data   ○ x-www-form-urlencoded         │
│ ○ raw    ○ binary      ○ GraphQL                       │
│                                                         │
│ ● form-data                                             │
│                                                         │
│ ┌─────────┬──────────────────────────────┬──────────┐  │
│ │ KEY     │ VALUE                        │ Type ▼  │  │
│ ├─────────┼──────────────────────────────┼──────────┤  │
│ │ file    │ [Select Files]               │ File    │  │
│ │         │ test-profile.jpg             │         │  │
│ └─────────┴──────────────────────────────┴──────────┘  │
└─────────────────────────────────────────────────────────┘

IMPORTANT: Changez le type de "Text" à "File" dans le menu déroulant
```

### Configuration de l'Authorization

```
┌─────────────────────────────────────────────────────────┐
│ Authorization                                           │
├─────────────────────────────────────────────────────────┤
│ Type: Bearer Token ▼                                    │
│                                                         │
│ Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...        │
│                                                         │
│ [x] Include in headers                                  │
└─────────────────────────────────────────────────────────┘

Ou utilisez la variable: {{token}}
```

---

## 🧪 Tests complets

### Test 1: Upload PNG
- Fichier: `test-files/test-profile.png`
- Statut attendu: 200 OK

### Test 2: Upload JPG
- Fichier: `test-files/test-profile.jpg`
- Statut attendu: 200 OK

### Test 3: Sans fichier
- Ne sélectionnez aucun fichier
- Statut attendu: 400 Bad Request
- Message: "Aucun fichier fourni"

### Test 4: Sans token
- Supprimez le token de l'Authorization
- Statut attendu: 401 Unauthorized

---

## 🔍 Vérifier le résultat

Après l'upload, vérifiez avec:

**GET** `{{base_url}}/users/me`

La réponse devrait contenir:
```json
{
  "success": true,
  "data": {
    "profile": {
      "photo": "uploads/images/1730000000000-profile.jpg"  // ← Photo mise à jour
    }
  }
}
```

---

## ⚡ Raccourcis Postman utiles

- `Ctrl+Enter` : Envoyer la requête
- `Ctrl+S` : Sauvegarder la requête
- `Ctrl+E` : Gérer les environnements
- `Alt+↑/↓` : Naviguer entre les requêtes

---

## 🆘 Problèmes courants

### ❌ "Cannot read property 'file' of undefined"
**Cause** : Le champ n'est pas nommé "file"
**Solution** : Vérifiez que la KEY est exactement `file` (sensible à la casse)

### ❌ "Aucun fichier fourni"
**Cause** : Aucun fichier sélectionné ou mauvais type
**Solution** : Assurez-vous d'avoir changé le type de "Text" à "File" et sélectionné un fichier

### ❌ "Unauthorized"
**Cause** : Token manquant ou expiré
**Solution** :
1. Reconnectez-vous avec `/auth/login`
2. Mettez à jour le token dans les variables
3. Vérifiez que l'Authorization est bien configurée

### ❌ "Type de fichier non supporté"
**Cause** : Format de fichier invalide
**Solution** : Utilisez JPG, PNG, GIF ou WEBP uniquement

### ❌ "File too large"
**Cause** : Le fichier dépasse la limite
**Solution** : Vérifiez la limite dans `multer.config.ts` et utilisez une image plus petite

---

## 📝 Checklist avant de tester

- [ ] Le serveur NestJS est démarré (`npm run start:dev`)
- [ ] J'ai importé la collection Postman
- [ ] J'ai configuré la variable `base_url`
- [ ] J'ai un token JWT valide dans la variable `token`
- [ ] J'ai créé les images de test avec `node create-test-image.js`
- [ ] Le dossier `uploads/images/` existe et a les permissions d'écriture

---

## 💡 Astuce Pro

Créez un **Pre-request Script** pour vérifier si le token est expiré :

```javascript
// Dans l'onglet "Pre-request Script" de la collection
const token = pm.variables.get("token");

if (!token || token === "YOUR_JWT_TOKEN_HERE") {
    console.warn("⚠️ Token non configuré ! Veuillez vous connecter d'abord.");
}
```

Et un **Test Script** pour valider automatiquement :

```javascript
// Dans l'onglet "Tests" de la requête Upload
pm.test("Status is 200", () => pm.response.to.have.status(200));
pm.test("Has success property", () => pm.expect(pm.response.json().success).to.be.true);
pm.test("Has photo URL", () => pm.expect(pm.response.json().data.url).to.exist);
```

---

Vous êtes prêt à tester ! 🎉
