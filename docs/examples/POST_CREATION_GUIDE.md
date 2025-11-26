# Guide Complet : Créer des Posts avec JWT

## 🔑 Prérequis : Obtenir un Token JWT

Avant de créer un post, vous devez vous authentifier et obtenir un token JWT.

### Se connecter

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "votre_mot_de_passe"
  }'
```

**Réponse :**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJUeXBlIjoidXNlciIsImlhdCI6MTcwNjg3NjU0MywiZXhwIjoxNzA2ODgwMTQzfQ.xxxxx",
  "userType": "user"
}
```

**Important :** Copiez le `access_token` pour l'utiliser dans les requêtes suivantes.

---

## 📝 Les 3 Façons de Créer un Post

### 1️⃣ Post Personnel (Public)

Poster sur votre propre profil, visible par vos followers.

**Endpoint :** `POST /posts`

**Headers requis :**
```
Authorization: Bearer VOTRE_TOKEN_ICI
Content-Type: application/json
```

**Body JSON :**
```json
{
  "contenu": "Ceci est mon premier post personnel !"
}
```

**❌ NE PAS INCLURE :**
- `posted_by_id` (automatiquement rempli depuis le JWT)
- `posted_by_type` (automatiquement rempli depuis le JWT)
- `groupe_id` (laisser null pour un post personnel)
- `societe_id` (laisser null pour un post personnel)

**Exemple complet avec cURL :**
```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "contenu": "Ceci est mon premier post personnel !"
  }'
```

**Avec image :**
```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contenu": "Mon post avec une belle photo !",
    "images": ["uploads/images/photo-123456.jpg"]
  }'
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Post créé avec succès",
  "data": {
    "id": 1,
    "contenu": "Ceci est mon premier post personnel !",
    "posted_by_id": 1,
    "posted_by_type": "User",
    "groupe_id": null,
    "societe_id": null,
    "visibility": "public",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2️⃣ Post dans un Groupe

Poster dans un groupe dont vous êtes membre.

**Endpoint :** `POST /posts`

**Body JSON :**
```json
{
  "groupe_id": 5,
  "contenu": "Message pour le groupe !",
  "visibility": "membres_only"
}
```

**Options de visibilité :**
- `"public"` - Tout le monde peut voir (même les non-membres)
- `"membres_only"` - Seulement les membres du groupe
- `"admins_only"` - Seulement les administrateurs du groupe

**Exemple complet :**
```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupe_id": 5,
    "contenu": "Discussion privée pour les membres du groupe",
    "visibility": "membres_only"
  }'
```

**Avec média :**
```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupe_id": 5,
    "contenu": "Photos de notre événement !",
    "images": ["uploads/images/event-1.jpg", "uploads/images/event-2.jpg"],
    "visibility": "membres_only"
  }'
```

**Vérifications automatiques :**
- ✅ Vous devez être membre du groupe #5
- ❌ Si vous n'êtes pas membre → Erreur 403

**Réponse en cas d'erreur (non-membre) :**
```json
{
  "statusCode": 403,
  "message": "Vous devez être membre du groupe pour y publier",
  "error": "Forbidden"
}
```

---

### 3️⃣ Post sur la Page d'une Société

Poster sur la page d'une société (vous devez être employé ou c'est la société qui poste).

**Endpoint :** `POST /posts`

#### A. User employé poste sur la page de sa société

**Body JSON :**
```json
{
  "societe_id": 10,
  "contenu": "Annonce interne pour l'entreprise",
  "visibility": "membres_only"
}
```

**Exemple complet :**
```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer VOTRE_TOKEN_USER" \
  -H "Content-Type: application/json" \
  -d '{
    "societe_id": 10,
    "contenu": "Rappel : Réunion demain à 10h",
    "visibility": "membres_only"
  }'
```

**Vérifications automatiques :**
- ✅ Vous devez être employé/membre de la société #10
- ❌ Si vous n'êtes pas employé → Erreur 403

#### B. Société poste sur sa propre page

Si vous êtes connecté en tant que Société (avec un token société) :

```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer TOKEN_SOCIETE" \
  -H "Content-Type: application/json" \
  -d '{
    "societe_id": 10,
    "contenu": "Nouvelle offre d emploi disponible !",
    "visibility": "public"
  }'
```

**Important :** Une société peut SEULEMENT poster sur sa propre page.

**❌ Interdit :**
```json
{
  "societe_id": 20,  // ❌ Société #10 ne peut pas poster sur la page de Société #20
  "contenu": "..."
}
```

---

## 🎨 Exemples Complets avec Médias

### Post personnel avec image + vidéo + audio

```bash
# 1. D'abord, uploader les fichiers
IMAGE=$(curl -s -X POST http://localhost:3000/media/upload/image \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -F "file=@photo.jpg" | jq -r '.data.url')

VIDEO=$(curl -s -X POST http://localhost:3000/media/upload/video \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -F "file=@video.mp4" | jq -r '.data.url')

AUDIO=$(curl -s -X POST http://localhost:3000/media/upload/audio \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -F "file=@audio.mp3" | jq -r '.data.url')

# 2. Créer le post avec tous les médias
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"contenu\": \"Post multimédia complet !\",
    \"images\": [\"$IMAGE\"],
    \"videos\": [\"$VIDEO\"],
    \"audios\": [\"$AUDIO\"]
  }"
```

### Post dans un groupe avec plusieurs images

```bash
# 1. Upload des images
IMAGE1=$(curl -s -X POST http://localhost:3000/media/upload/image \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -F "file=@image1.jpg" | jq -r '.data.url')

IMAGE2=$(curl -s -X POST http://localhost:3000/media/upload/image \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -F "file=@image2.jpg" | jq -r '.data.url')

IMAGE3=$(curl -s -X POST http://localhost:3000/media/upload/image \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -F "file=@image3.jpg" | jq -r '.data.url')

# 2. Créer le post dans le groupe
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"groupe_id\": 5,
    \"contenu\": \"Album photo de notre événement\",
    \"images\": [\"$IMAGE1\", \"$IMAGE2\", \"$IMAGE3\"],
    \"visibility\": \"membres_only\"
  }"
```

---

## 📊 Tableau Récapitulatif

| Contexte | Champs requis | Exemple |
|----------|---------------|---------|
| **Post personnel** | `contenu` uniquement | `{"contenu": "Mon post"}` |
| **Post dans groupe** | `contenu` + `groupe_id` | `{"contenu": "...", "groupe_id": 5}` |
| **Post sur société** | `contenu` + `societe_id` | `{"contenu": "...", "societe_id": 10}` |

### Champs Optionnels

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `images` | `string[]` | URLs des images | `["uploads/images/photo.jpg"]` |
| `videos` | `string[]` | URLs des vidéos | `["uploads/videos/video.mp4"]` |
| `audios` | `string[]` | URLs des audios | `["uploads/audios/audio.mp3"]` |
| `documents` | `string[]` | URLs des documents | `["uploads/docs/doc.pdf"]` |
| `visibility` | `string` | Visibilité | `"public"`, `"membres_only"`, `"admins_only"` |

### Champs AUTOMATIQUES (ne pas envoyer)

| Champ | Description |
|-------|-------------|
| `posted_by_id` | Rempli automatiquement depuis le JWT |
| `posted_by_type` | Rempli automatiquement depuis le JWT (`"User"` ou `"Societe"`) |
| `id` | Généré par la base de données |
| `created_at` | Généré automatiquement |
| `updated_at` | Généré automatiquement |

---

## ❌ Erreurs Courantes

### Erreur 1 : Token manquant

**Requête :**
```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"contenu": "Test"}'
```

**Erreur :**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Solution :** Ajoutez le header `Authorization: Bearer VOTRE_TOKEN`

---

### Erreur 2 : Champs `posted_by_id` et `posted_by_type` envoyés

**Requête incorrecte :**
```json
{
  "contenu": "Test",
  "posted_by_id": 1,
  "posted_by_type": "User"
}
```

**Erreur :**
```json
{
  "status": false,
  "message": [
    "property posted_by_id should not exist",
    "property posted_by_type should not exist"
  ]
}
```

**Solution :** Ne PAS inclure ces champs, ils sont automatiques.

**Requête correcte :**
```json
{
  "contenu": "Test"
}
```

---

### Erreur 3 : Non membre du groupe

**Requête :**
```json
{
  "groupe_id": 5,
  "contenu": "Test"
}
```

**Erreur :**
```json
{
  "statusCode": 403,
  "message": "Vous devez être membre du groupe pour y publier",
  "error": "Forbidden"
}
```

**Solution :** Rejoignez d'abord le groupe ou choisissez un groupe dont vous êtes membre.

---

### Erreur 4 : Groupe ET Société en même temps

**Requête incorrecte :**
```json
{
  "groupe_id": 5,
  "societe_id": 10,
  "contenu": "Test"
}
```

**Erreur :**
```json
{
  "statusCode": 403,
  "message": "Un post ne peut pas être publié dans un groupe ET une société en même temps",
  "error": "Forbidden"
}
```

**Solution :** Choisissez SOIT `groupe_id` SOIT `societe_id`, pas les deux.

---

## 🧪 Tests avec Postman

### Configuration de l'environnement Postman

1. Créer un environnement "Local"
2. Ajouter les variables :

```
base_url: http://localhost:3000
token: (vide au début, sera rempli après login)
```

### 1. Login

- **Method:** POST
- **URL:** `{{base_url}}/auth/login`
- **Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Tests (pour sauvegarder le token) :**
```javascript
pm.environment.set("token", pm.response.json().access_token);
```

### 2. Créer un Post Personnel

- **Method:** POST
- **URL:** `{{base_url}}/posts`
- **Headers:**
  - `Authorization: Bearer {{token}}`
- **Body (JSON):**
```json
{
  "contenu": "Mon premier post via Postman !"
}
```

### 3. Créer un Post dans un Groupe

- **Method:** POST
- **URL:** `{{base_url}}/posts`
- **Headers:**
  - `Authorization: Bearer {{token}}`
- **Body (JSON):**
```json
{
  "groupe_id": 5,
  "contenu": "Post dans le groupe",
  "visibility": "membres_only"
}
```

### 4. Créer un Post avec Image

- **Method:** POST
- **URL:** `{{base_url}}/posts`
- **Headers:**
  - `Authorization: Bearer {{token}}`
- **Body (JSON):**
```json
{
  "contenu": "Post avec image",
  "images": ["uploads/images/photo-123.jpg"]
}
```

---

## 📱 Exemples JavaScript (Frontend)

### Fonction de création de post

```javascript
async function createPost(contenu, options = {}) {
  const token = localStorage.getItem('access_token');

  const body = {
    contenu,
    ...options // { groupe_id, societe_id, images, videos, etc. }
  };

  const response = await fetch('http://localhost:3000/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// Utilisation :

// Post personnel
await createPost("Mon post personnel !");

// Post dans un groupe
await createPost("Message pour le groupe", {
  groupe_id: 5,
  visibility: "membres_only"
});

// Post avec image
await createPost("Photo de vacances", {
  images: ["uploads/images/photo.jpg"]
});

// Post dans une société avec vidéo
await createPost("Présentation du nouveau produit", {
  societe_id: 10,
  videos: ["uploads/videos/demo.mp4"],
  visibility: "public"
});
```

---

## ✅ Checklist avant de poster

- [ ] J'ai un token JWT valide
- [ ] J'inclus le header `Authorization: Bearer TOKEN`
- [ ] Je n'envoie PAS `posted_by_id` ni `posted_by_type`
- [ ] Si je poste dans un groupe : je suis membre du groupe
- [ ] Si je poste dans une société : je suis employé de cette société
- [ ] Je n'ai PAS mis `groupe_id` ET `societe_id` en même temps
- [ ] Le champ `contenu` est présent (obligatoire)

---

## 🎯 Résumé Ultra-Rapide

### Post Personnel
```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contenu": "Mon post"}'
```

### Post Groupe
```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contenu": "Mon post", "groupe_id": 5, "visibility": "membres_only"}'
```

### Post Société
```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contenu": "Mon post", "societe_id": 10, "visibility": "membres_only"}'
```

Voilà ! Vous savez maintenant comment créer des posts dans les 3 contextes différents ! 🚀
