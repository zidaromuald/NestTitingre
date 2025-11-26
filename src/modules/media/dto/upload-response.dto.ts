// modules/media/dto/upload-response.dto.ts
import { MediaType } from '../enums/media-type.enum';

export interface UploadResponseDto {
  success: boolean;
  message: string;
  data: {
    path: string;     // Chemin relatif à stocker en BDD (ex: "uploads/images/photo.jpg")
    url: string;      // URL complète pour affichage immédiat
    filename: string;
    size: number;
    mimetype: string;
    type: MediaType;
  };
}
