// modules/media/dto/upload-response.dto.ts
import { MediaType } from '../enums/media-type.enum';

export interface UploadResponseDto {
  success: boolean;
  message: string;
  data: {
    url: string;
    filename: string;
    size: number;
    mimetype: string;
    type: MediaType;
  };
}
