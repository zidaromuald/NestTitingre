# Module Media

Module NestJS professionnel pour la gestion des uploads de fichiers.

## Vue d'ensemble

Ce module gère tous les uploads de fichiers de l'application de manière centralisée et réutilisable.

## Types de Médias Supportés

| Type | Formats | Taille Max | Destination |
|------|---------|------------|-------------|
| Image | JPEG, PNG, GIF, WebP | 5MB | `./uploads/images/` |
| Vidéo | MP4, MPEG, WebM, MOV | 50MB | `./uploads/videos/` |
| Audio | MP3, WAV, OGG | 10MB | `./uploads/audios/` |
| Document | PDF, DOC, DOCX, XLS, XLSX, TXT | 10MB | `./uploads/documents/` |

## API Endpoints

### Upload Image
```
POST /media/upload/image
```

### Upload Video
```
POST /media/upload/video
```

### Upload Audio
```
POST /media/upload/audio
```

### Upload Document
```
POST /media/upload/document
```

## Structure

```
media/
├── controllers/
│   └── media.controller.ts       # Routes HTTP
├── services/
│   └── media.service.ts          # Logique métier
├── dto/
│   └── upload-response.dto.ts    # Types de réponse
├── enums/
│   └── media-type.enum.ts        # Configuration des types
├── config/
│   └── multer.config.ts          # Configuration Multer
└── media.module.ts               # Module NestJS
```

## Utilisation

### Dans un autre module

```typescript
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
})
export class AutreModule {}
```

### Dans un service

```typescript
import { MediaService } from '../media/services/media.service';
import { MediaType } from '../media/enums/media-type.enum';

@Injectable()
export class MonService {
  constructor(private readonly mediaService: MediaService) {}

  async uploadProfilePicture(file: Express.Multer.File) {
    return this.mediaService.handleUpload(file, MediaType.IMAGE);
  }
}
```

## Configuration

### Modifier les limites de taille

Éditer `enums/media-type.enum.ts`:

```typescript
export const MEDIA_TYPE_CONFIG = {
  [MediaType.IMAGE]: {
    maxSize: 5 * 1024 * 1024, // Modifier ici
  },
};
```

### Ajouter un nouveau type de média

1. Ajouter le type dans l'enum:
```typescript
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  NOUVELLE_TYPE = 'nouvelle_type', // Nouveau
}
```

2. Ajouter la configuration:
```typescript
export const MEDIA_TYPE_CONFIG = {
  // ...
  [MediaType.NOUVELLE_TYPE]: {
    allowedMimeTypes: ['type/mime'],
    maxSize: 10 * 1024 * 1024,
    destination: './uploads/nouvelle_type',
    extensions: ['.ext'],
  },
};
```

3. Ajouter l'endpoint dans le controller:
```typescript
@Post('upload/nouvelle-type')
@UseInterceptors(FileInterceptor('file', getMulterOptions(MediaType.NOUVELLE_TYPE)))
async uploadNouveau(@UploadedFile() file: Express.Multer.File) {
  return this.mediaService.handleUpload(file, MediaType.NOUVELLE_TYPE);
}
```

## Migration vers Cloud Storage

### AWS S3

1. Installer le SDK:
```bash
npm install @aws-sdk/client-s3
```

2. Implémenter dans `media.service.ts`:
```typescript
async uploadToS3(file: Express.Multer.File): Promise<string> {
  const s3Client = new S3Client({ region: 'us-east-1' });

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: file.filename,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);
  return `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${file.filename}`;
}
```

### Azure Blob Storage

1. Installer le SDK:
```bash
npm install @azure/storage-blob
```

2. Implémenter dans `media.service.ts`:
```typescript
async uploadToAzure(file: Express.Multer.File): Promise<string> {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );

  const containerClient = blobServiceClient.getContainerClient('uploads');
  const blockBlobClient = containerClient.getBlockBlobClient(file.filename);

  await blockBlobClient.uploadData(file.buffer);
  return blockBlobClient.url;
}
```

## Tests

### Exemple de test unitaire

```typescript
import { Test } from '@nestjs/testing';
import { MediaService } from './media.service';
import { MediaType } from '../enums/media-type.enum';

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MediaService],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  it('should generate correct file URL', async () => {
    const mockFile = {
      filename: 'test-123.jpg',
      size: 1024,
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    const result = await service.handleUpload(mockFile, MediaType.IMAGE);

    expect(result.data.url).toContain('/uploads/images/test-123.jpg');
  });
});
```

## Sécurité

### Validations actuelles
- ✅ Validation du type MIME
- ✅ Validation de la taille
- ✅ Génération de noms uniques
- ✅ Extension de fichier vérifiée

### Améliorations futures
- ⏳ Scan antivirus
- ⏳ Vérification du contenu réel
- ⏳ Rate limiting
- ⏳ Quotas utilisateur
- ⏳ Compression automatique

## Performance

### Optimisations possibles
- Compression d'images (sharp, jimp)
- Génération de thumbnails
- Conversion de formats
- CDN pour la distribution

## Licence

Privé - Projet TiTingre
