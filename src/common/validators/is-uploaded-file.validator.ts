import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Validator qui vérifie que les URLs proviennent de fichiers uploadés sur le serveur
 * Accepte uniquement les URLs qui commencent par le pattern d'upload du serveur
 */
export function IsUploadedFile(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isUploadedFile',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Si la valeur est undefined ou null, c'est OK (champ optionnel)
          if (!value) {
            return true;
          }

          // Si c'est un tableau d'URLs
          if (Array.isArray(value)) {
            return value.every((url) => isValidUploadUrl(url));
          }

          // Si c'est une seule URL
          if (typeof value === 'string') {
            return isValidUploadUrl(value);
          }

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          const mediaType = getMediaTypeFromProperty(args.property);
          return `Toutes les ${mediaType} doivent provenir de fichiers uploadés sur le serveur (pattern: ${getAllowedPattern()})`;
        },
      },
    });
  };
}

/**
 * Vérifie si une URL correspond au pattern des fichiers uploadés
 */
function isValidUploadUrl(url: string): boolean {
  if (typeof url !== 'string' || url.trim() === '') {
    return false;
  }

  // Pattern pour chemin relatif (RECOMMANDÉ - à stocker en BDD)
  const relativePattern = /^uploads\/(images|videos|audios|documents)\/.+\.(jpg|jpeg|png|gif|webp|mp4|mpeg|webm|mov|mp3|wav|ogg|pdf|doc|docx|xls|xlsx|txt)$/i;

  // Pattern pour les URLs d'upload locales (rétrocompatibilité)
  const localPattern = /^http:\/\/localhost:\d+\/uploads\/(images|videos|audios|documents)\/.+\.(jpg|jpeg|png|gif|webp|mp4|mpeg|webm|mov|mp3|wav|ogg|pdf|doc|docx|xls|xlsx|txt)$/i;

  // Pattern pour les URLs de production (rétrocompatibilité)
  const productionPattern = /^https?:\/\/.+\/uploads\/(images|videos|audios|documents)\/.+\.(jpg|jpeg|png|gif|webp|mp4|mpeg|webm|mov|mp3|wav|ogg|pdf|doc|docx|xls|xlsx|txt)$/i;

  // Accepte: chemin relatif OU URLs complètes
  return relativePattern.test(url) || localPattern.test(url) || productionPattern.test(url);
}

/**
 * Retourne le pattern autorisé pour les messages d'erreur
 */
function getAllowedPattern(): string {
  return 'uploads/{type}/{filename} ou http://localhost:3000/uploads/{type}/{filename}';
}

/**
 * Détermine le type de média à partir du nom de la propriété
 */
function getMediaTypeFromProperty(property: string): string {
  const mediaTypes: { [key: string]: string } = {
    images: 'images',
    videos: 'vidéos',
    audios: 'audios',
    documents: 'documents',
  };

  return mediaTypes[property] || 'fichiers';
}
