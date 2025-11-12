// modules/media/enums/media-type.enum.ts
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

export const MEDIA_TYPE_CONFIG = {
  [MediaType.IMAGE]: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    destination: './uploads/images',
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  },
  [MediaType.VIDEO]: {
    allowedMimeTypes: ['video/mp4', 'video/mpeg', 'video/webm', 'video/quicktime'],
    maxSize: 50 * 1024 * 1024, // 50MB
    destination: './uploads/videos',
    extensions: ['.mp4', '.mpeg', '.webm', '.mov'],
  },
  [MediaType.AUDIO]: {
    allowedMimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    maxSize: 10 * 1024 * 1024, // 10MB
    destination: './uploads/audios',
    extensions: ['.mp3', '.mpeg', '.wav', '.ogg'],
  },
  [MediaType.DOCUMENT]: {
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    destination: './uploads/documents',
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
  },
};
