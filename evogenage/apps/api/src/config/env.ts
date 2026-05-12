import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  JWT_SECRET: z.string().min(32),
  APP_URL: z.string().url(),
  STORAGE_PROVIDER: z.enum(['local', 'supabase', 's3']).default('local'),
  IMAGE_PROVIDER_PRIMARY: z.string().optional(),
});

export const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ [SovereignGuard] Environment Validation Failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`   - ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
};

export const CONFIG = validateEnv();
