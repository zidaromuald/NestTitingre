# Guide du Module Media

## Architecture

Le module Media est un module séparé et réutilisable pour gérer tous les uploads de fichiers dans l'application.

### Structure du Module

```
src/modules/media/
├── controllers/
│   └── media.controller.ts      # Endpoints d'upload
├── services/
│   └── media.service.ts         # Logique métier
├── dto/
│   └── upload-response.dto.ts   # Format de réponse
├── enums/
│   └── media-type.enum.ts       # Types et configurations
├── config/
│   └── multer.config.ts         # Configuration Multer
├── media.module.ts              # Module NestJS
└── index.ts                     # Exports
```

## Endpoints Disponibles

### 1. Upload d'Image
```http
POST /media/upload/image
Content-Type: multipart/form-data

Body: file (fichier à uploader)
```

**Formats acceptés**: JPEG, PNG, GIF, WebP
**Taille max**: 5MB

**Réponse**:
```json
{
  "success": true,
  "message": "Image uploadée avec succès",
  "data": {
    "url": "http://localhost:3000/uploads/images/image-1234567890-123456789.jpg",
    "filename": "image-1234567890-123456789.jpg",
    "size": 2048576,
    "mimetype": "image/jpeg",
    "type": "image"
  }
}
```

### 2. Upload de Vidéo
```http
POST /media/upload/video
```

**Formats acceptés**: MP4, MPEG, WebM, MOV
**Taille max**: 50MB

### 3. Upload Audio
```http
POST /media/upload/audio
```

**Formats acceptés**: MP3, WAV, OGG
**Taille max**: 10MB

### 4. Upload Document
```http
POST /media/upload/document
```

**Formats acceptés**: PDF, DOC, DOCX, XLS, XLSX, TXT
**Taille max**: 10MB

## Workflow Complet

### Étape 1: Upload du fichier
```bash
# Exemple avec cURL
curl -X POST http://localhost:3000/media/upload/image \
  -F "file=@/path/to/image.jpg"
```

### Étape 2: Créer un post avec l'URL
```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "contenu": "Ma nouvelle photo!",
    "images": ["http://localhost:3000/uploads/images/image-1234567890-123456789.jpg"],
    "visibility": "public"
  }'
```

## Test avec Postman

### Upload d'Image

1. **Créer une nouvelle requête**
   - Méthode: `POST`
   - URL: `http://localhost:3000/media/upload/image`

2. **Configurer le Body**
   - Type: `form-data`
   - Ajouter une clé `file` de type `File`
   - Sélectionner votre image

3. **Envoyer la requête**
   - Récupérer l'URL du fichier dans la réponse

4. **Créer un post**
   - Méthode: `POST`
   - URL: `http://localhost:3000/posts`
   - Body (raw JSON):
   ```json
   {
     "contenu": "Voici ma publication",
     "images": ["URL_RECUE_DANS_ETAPE_3"],
     "visibility": "public"
   }
   ```

## Configuration

### Variables d'Environnement

Dans votre fichier `.env`:
```env
APP_URL=http://localhost:3000
```

Cette variable est utilisée pour construire l'URL complète des fichiers uploadés.

### Tailles Limites

Les limites sont configurées dans `media-type.enum.ts`:

```typescript
export const MEDIA_TYPE_CONFIG = {
  [MediaType.IMAGE]: {
    maxSize: 5 * 1024 * 1024, // 5MB
    // ...
  },
  [MediaType.VIDEO]: {
    maxSize: 50 * 1024 * 1024, // 50MB
    // ...
  },
  // ...
};
```

## Stockage

### Actuel: Stockage Local

Les fichiers sont stockés localement dans:
```
uploads/
├── images/
├── videos/
├── audios/
└── documents/
```

### Futur: Cloud Storage (S3/Azure)

Le MediaService a des méthodes TODO préparées pour:
- AWS S3: `uploadToS3()`
- Azure Blob Storage: `uploadToAzure()`

Pour migrer vers le cloud:
1. Installer le SDK approprié (AWS SDK ou Azure Storage SDK)
2. Implémenter les méthodes dans `media.service.ts`
3. Ajouter les credentials dans `.env`
4. Modifier `handleUpload()` pour utiliser le cloud au lieu du stockage local

## Réutilisation

Le MediaService est exporté et peut être utilisé dans d'autres modules:

```typescript
// Dans un autre module
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  // ...
})
export class MonAutreModule {}

// Dans un service
import { MediaService } from '../media/services/media.service';

@Injectable()
export class MonService {
  constructor(private readonly mediaService: MediaService) {}

  async uploadFile(file: Express.Multer.File) {
    return this.mediaService.handleUpload(file, MediaType.IMAGE);
  }
}
```

## Sécurité

### Validations Implémentées

1. **Type MIME**: Vérifie que le fichier correspond aux types autorisés
2. **Extension**: Vérifie l'extension du fichier
3. **Taille**: Limite la taille selon le type de média
4. **Nom unique**: Génère un nom unique pour éviter les collisions

### À Ajouter (TODO)

- [ ] Vérification du contenu réel du fichier (pas juste l'extension)
- [ ] Scan antivirus pour les uploads
- [ ] Rate limiting par utilisateur
- [ ] Quotas de stockage par utilisateur
- [ ] Watermarking pour les images
- [ ] Compression automatique des images/vidéos

## Avantages de cette Architecture

1. **Séparation des responsabilités**: Upload séparé de la création de posts
2. **Réutilisable**: Peut être utilisé pour posts, messages, profils, etc.
3. **Maintenable**: Toute la logique d'upload au même endroit
4. **Évolutif**: Facile de migrer vers S3/Azure/Cloudinary
5. **Testable**: Service isolé facile à tester
6. **Professionnel**: Suit les best practices de NestJS

## Approche 1 (Utilisée)

Cette implémentation utilise l'**Approche 1: Upload Séparé**, identique à:
- Instagram
- WhatsApp
- TikTok
- Telegram

**Workflow**:
1. Client upload le fichier → Reçoit URL
2. Client crée le post avec l'URL

**Avantages**:
- Meilleure UX (preview avant publication)
- Permet d'annuler la publication sans perdre le fichier
- Upload parallèle de plusieurs fichiers
- Résilience (retry upload séparément)
