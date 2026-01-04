// cloudflare-r2/cloudflare-r2.provider.ts
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export const CloudflareR2Provider = {
  provide: 'CLOUDFLARE_R2_CLIENT',
  useFactory: (configService: ConfigService) => {
    const accountId = configService.get<string>('CLOUDFLARE_ACCOUNT_ID') || '';
    const accessKeyId = configService.get<string>('CLOUDFLARE_R2_ACCESS_KEY_ID') || '';
    const secretAccessKey = configService.get<string>('CLOUDFLARE_R2_SECRET_ACCESS_KEY') || '';

    return new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  },
  inject: [ConfigService],
};
