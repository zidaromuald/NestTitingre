// config/cloudflare-r2.config.ts
import { config } from 'dotenv';

config();

export const cloudflareR2Config = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'titingre-media',
  publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL, // URL publique du bucket (optionnel)

  // Endpoint R2 au format: https://<account_id>.r2.cloudflarestorage.com
  get endpoint() {
    return `https://${this.accountId}.r2.cloudflarestorage.com`;
  },

  region: 'auto', // R2 utilise 'auto' comme région
};
