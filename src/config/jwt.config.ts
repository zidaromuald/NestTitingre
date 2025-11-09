// config/jwt.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}));

/*export default registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;
  
  // ✅ Validation au niveau de la configuration
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET doit être défini et contenir au moins 32 caractères',
    );
  }

  return {
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  };
});*/