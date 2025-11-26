# Exemples de Tests pour les Posts avec Médias

Ce document contient des exemples pratiques pour tester les fonctionnalités de posts avec images, vidéos et audios.

## Table des matières
1. [Upload de médias](#1-upload-de-médias)
2. [Création de posts avec médias](#2-création-de-posts-avec-médias)
3. [Tests complets workflow](#3-tests-complets-workflow)

---

## 1. Upload de Médias

### 1.1 Upload d'une image

**Endpoint:** `POST /media/upload/image`

**cURL:**
```bash
curl -X POST http://localhost:3000/media/upload/image \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/image.jpg"
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Image uploadée avec succès",
  "data": {
    "url": "uploads/images/image-1234567890.jpg",
    "filename": "image-1234567890.jpg",
    "mimetype": "image/jpeg",
    "size": 245678
  }
}
```

### 1.2 Upload d'une vidéo

**Endpoint:** `POST /media/upload/video`

**cURL:**
```bash
curl -X POST http://localhost:3000/media/upload/video \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/video.mp4"
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Vidéo uploadée avec succès",
  "data": {
    "url": "uploads/videos/video-1234567890.mp4",
    "filename": "video-1234567890.mp4",
    "mimetype": "video/mp4",
    "size": 5245678
  }
}
```

### 1.3 Upload d'un fichier audio (message vocal)

**Endpoint:** `POST /media/upload/audio`

**cURL:**
```bash
curl -X POST http://localhost:3000/media/upload/audio \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/audio.mp3"
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Audio uploadé avec succès",
  "data": {
    "url": "uploads/audios/audio-1234567890.mp3",
    "filename": "audio-1234567890.mp3",
    "mimetype": "audio/mpeg",
    "size": 345678
  }
}
```

---

## 2. Création de Posts avec Médias

### 2.1 Post avec texte uniquement

**Endpoint:** `POST /posts`

**cURL:**
```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "contenu": "Ceci est mon premier post !"
  }'
```

**Body JSON:**
```json
{
  "contenu": "Ceci est mon premier post !"
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Post créé avec succès",
  "data": {
    "id": 1,
    "contenu": "Ceci est mon premier post !",
    "images": [],
    "videos": [],
    "audios": [],
    "visibility": "public",
    "likes_count": 0,
    "comments_count": 0,
    "shares_count": 0,
    "is_pinned": false,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2.2 Post avec une image

**Workflow:**
1. D'abord, upload l'image et récupérer l'URL
2. Ensuite, créer le post avec l'URL de l'image

**Étape 1: Upload de l'image**
```bash
curl -X POST http://localhost:3000/media/upload/image \
  -F "file=@photo.jpg"
```

**Réponse:**
```json
{
  "data": {
    "url": "uploads/images/photo-1234567890.jpg"
  }
}
```

**Étape 2: Créer le post avec l'image**
```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "contenu": "Regardez cette belle photo !",
    "images": ["uploads/images/photo-1234567890.jpg"]
  }'
```

**Body JSON:**
```json
{
  "contenu": "Regardez cette belle photo !",
  "images": ["uploads/images/photo-1234567890.jpg"]
}
```

### 2.3 Post avec plusieurs images

**Body JSON:**
```json
{
  "contenu": "Album photo de mes vacances",
  "images": [
    "uploads/images/photo-1.jpg",
    "uploads/images/photo-2.jpg",
    "uploads/images/photo-3.jpg",
    "uploads/images/photo-4.jpg"
  ]
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "contenu": "Album photo de mes vacances",
    "images": [
      "uploads/images/photo-1.jpg",
      "uploads/images/photo-2.jpg",
      "uploads/images/photo-3.jpg",
      "uploads/images/photo-4.jpg"
    ]
  }'
```

### 2.4 Post avec une vidéo

**Workflow:**
1. Upload la vidéo
2. Créer le post avec l'URL de la vidéo

**Étape 1: Upload de la vidéo**
```bash
curl -X POST http://localhost:3000/media/upload/video \
  -F "file=@ma-video.mp4"
```

**Étape 2: Créer le post**
```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "contenu": "Découvrez ma dernière vidéo !",
    "videos": ["uploads/videos/video-1234567890.mp4"]
  }'
```

**Body JSON:**
```json
{
  "contenu": "Découvrez ma dernière vidéo !",
  "videos": ["uploads/videos/video-1234567890.mp4"]
}
```

### 2.5 Post avec un message vocal (audio)

**Workflow:**
1. Upload le fichier audio
2. Créer le post avec l'URL de l'audio

**Étape 1: Upload de l'audio**
```bash
curl -X POST http://localhost:3000/media/upload/audio \
  -F "file=@message-vocal.mp3"
```

**Étape 2: Créer le post**
```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "contenu": "Écoutez mon message vocal",
    "audios": ["uploads/audios/audio-1234567890.mp3"]
  }'
```

**Body JSON:**
```json
{
  "contenu": "Écoutez mon message vocal",
  "audios": ["uploads/audios/audio-1234567890.mp3"]
}
```

### 2.6 Post multimédia complet (texte + images + vidéo + audio)

**Body JSON:**
```json
{
  "contenu": "Voici un post multimédia complet avec tout type de contenu !",
  "images": [
    "uploads/images/photo-1.jpg",
    "uploads/images/photo-2.jpg"
  ],
  "videos": [
    "uploads/videos/video-demo.mp4"
  ],
  "audios": [
    "uploads/audios/commentaire-vocal.mp3"
  ]
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "contenu": "Voici un post multimédia complet !",
    "images": ["uploads/images/photo-1.jpg", "uploads/images/photo-2.jpg"],
    "videos": ["uploads/videos/video-demo.mp4"],
    "audios": ["uploads/audios/commentaire-vocal.mp3"]
  }'
```

### 2.7 Post dans un groupe avec médias

**Body JSON:**
```json
{
  "groupe_id": 5,
  "contenu": "Post dans le groupe avec une photo",
  "images": ["uploads/images/groupe-event.jpg"],
  "visibility": "membres_only"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "groupe_id": 5,
    "contenu": "Post dans le groupe avec une photo",
    "images": ["uploads/images/groupe-event.jpg"],
    "visibility": "membres_only"
  }'
```

---

## 3. Tests Complets Workflow

### 3.1 Scénario: Créer un post avec image de A à Z

**Script bash complet:**
```bash
#!/bin/bash

# 1. Upload de l'image
echo "1. Upload de l'image..."
IMAGE_RESPONSE=$(curl -s -X POST http://localhost:3000/media/upload/image \
  -F "file=@test-image.jpg")

# Extraire l'URL de l'image de la réponse
IMAGE_URL=$(echo $IMAGE_RESPONSE | jq -r '.data.url')
echo "Image uploadée: $IMAGE_URL"

# 2. Créer le post avec l'image
echo "2. Création du post..."
POST_RESPONSE=$(curl -s -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d "{
    \"contenu\": \"Mon post avec image\",
    \"images\": [\"$IMAGE_URL\"]
  }")

# Afficher la réponse
echo "Post créé:"
echo $POST_RESPONSE | jq '.'

# Extraire l'ID du post
POST_ID=$(echo $POST_RESPONSE | jq -r '.data.id')
echo "ID du post créé: $POST_ID"

# 3. Récupérer le post pour vérifier
echo "3. Vérification du post..."
curl -s http://localhost:3000/posts/$POST_ID | jq '.'
```

### 3.2 Scénario: Post multimédia complet

**Script bash:**
```bash
#!/bin/bash

# 1. Upload de tous les médias
echo "Upload des médias..."

# Upload image
IMAGE=$(curl -s -X POST http://localhost:3000/media/upload/image \
  -F "file=@photo.jpg" | jq -r '.data.url')

# Upload vidéo
VIDEO=$(curl -s -X POST http://localhost:3000/media/upload/video \
  -F "file=@video.mp4" | jq -r '.data.url')

# Upload audio
AUDIO=$(curl -s -X POST http://localhost:3000/media/upload/audio \
  -F "file=@audio.mp3" | jq -r '.data.url')

echo "Image: $IMAGE"
echo "Vidéo: $VIDEO"
echo "Audio: $AUDIO"

# 2. Créer le post avec tous les médias
echo "Création du post multimédia..."
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d "{
    \"contenu\": \"Post multimédia complet !\",
    \"images\": [\"$IMAGE\"],
    \"videos\": [\"$VIDEO\"],
    \"audios\": [\"$AUDIO\"]
  }" | jq '.'
```

### 3.3 Scénario: Tests avec Postman/Thunder Client

**Collection Postman:**

1. **Upload Image**
   - Method: POST
   - URL: `{{base_url}}/media/upload/image`
   - Body: form-data
     - Key: `file` (type: File)
     - Value: Sélectionner un fichier image

2. **Upload Video**
   - Method: POST
   - URL: `{{base_url}}/media/upload/video`
   - Body: form-data
     - Key: `file` (type: File)
     - Value: Sélectionner un fichier vidéo

3. **Upload Audio**
   - Method: POST
   - URL: `{{base_url}}/media/upload/audio`
   - Body: form-data
     - Key: `file` (type: File)
     - Value: Sélectionner un fichier audio

4. **Create Post with Media**
   - Method: POST
   - URL: `{{base_url}}/posts`
   - Body: raw (JSON)
   ```json
   {
     "contenu": "Mon post avec média",
     "images": ["{{image_url}}"],
     "videos": ["{{video_url}}"],
     "audios": ["{{audio_url}}"]
   }
   ```

**Variables d'environnement Postman:**
```json
{
  "base_url": "http://localhost:3000",
  "image_url": "uploads/images/photo-1234.jpg",
  "video_url": "uploads/videos/video-1234.mp4",
  "audio_url": "uploads/audios/audio-1234.mp3"
}
```

---

## 4. Autres Opérations sur les Posts

### 4.1 Récupérer un post

```bash
curl -X GET http://localhost:3000/posts/1
```

### 4.2 Mettre à jour un post

```bash
curl -X PUT http://localhost:3000/posts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "contenu": "Contenu mis à jour",
    "images": ["uploads/images/new-photo.jpg"]
  }'
```

### 4.3 Supprimer un post

```bash
curl -X DELETE http://localhost:3000/posts/1
```

### 4.4 Partager un post

```bash
curl -X POST http://localhost:3000/posts/1/share
```

### 4.5 Épingler un post

```bash
curl -X PUT http://localhost:3000/posts/1/pin
```

### 4.6 Récupérer le feed avec uniquement les posts avec médias

```bash
curl -X GET "http://localhost:3000/posts/feed/public?onlyWithMedia=true&limit=20"
```

### 4.7 Rechercher des posts avec médias

```bash
curl -X GET "http://localhost:3000/posts/search/query?q=photo&hasMedia=true"
```

---

## 5. Validation et Tests d'Erreurs

### 5.1 Post sans contenu (devrait échouer)

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "images": ["uploads/images/photo.jpg"]
  }'
```

**Réponse attendue: Erreur 400**

### 5.2 Upload d'un fichier non autorisé

```bash
curl -X POST http://localhost:3000/media/upload/image \
  -F "file=@document.pdf"
```

**Réponse attendue: Erreur 400 - Type de fichier non autorisé**

### 5.3 Fichier trop volumineux

Upload d'une vidéo de plus de 100 Mo devrait échouer.

---

## 6. Notes Importantes

### Types de fichiers acceptés:

- **Images:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- **Vidéos:** `.mp4`, `.avi`, `.mov`, `.webm`
- **Audios:** `.mp3`, `.wav`, `.ogg`, `.m4a`

### Limites de taille:
- Images: 5 Mo max
- Vidéos: 100 Mo max
- Audios: 10 Mo max

### Visibilité des posts:
- `public`: Visible par tous
- `membres_only`: Visible uniquement par les membres du groupe
- `admins_only`: Visible uniquement par les administrateurs du groupe

---

## 7. Exemples JavaScript (Frontend)

### 7.1 Upload et création de post avec Fetch API

```javascript
// Upload d'une image
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:3000/media/upload/image', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  return data.data.url;
}

// Créer un post avec l'image
async function createPostWithImage(contenu, imageFile) {
  // 1. Upload de l'image
  const imageUrl = await uploadImage(imageFile);

  // 2. Créer le post
  const response = await fetch('http://localhost:3000/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contenu,
      images: [imageUrl]
    })
  });

  return await response.json();
}

// Utilisation
const fileInput = document.querySelector('#imageInput');
const file = fileInput.files[0];
createPostWithImage('Mon post avec image', file)
  .then(post => console.log('Post créé:', post))
  .catch(error => console.error('Erreur:', error));
```

### 7.2 Upload multiple et post multimédia

```javascript
async function createMultimediaPost(contenu, images, videos, audios) {
  // Upload de tous les fichiers en parallèle
  const imagePromises = images.map(file => uploadFile(file, 'image'));
  const videoPromises = videos.map(file => uploadFile(file, 'video'));
  const audioPromises = audios.map(file => uploadFile(file, 'audio'));

  const [imageUrls, videoUrls, audioUrls] = await Promise.all([
    Promise.all(imagePromises),
    Promise.all(videoPromises),
    Promise.all(audioPromises)
  ]);

  // Créer le post
  const response = await fetch('http://localhost:3000/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contenu,
      images: imageUrls,
      videos: videoUrls,
      audios: audioUrls
    })
  });

  return await response.json();
}

async function uploadFile(file, type) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`http://localhost:3000/media/upload/${type}`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  return data.data.url;
}
```
