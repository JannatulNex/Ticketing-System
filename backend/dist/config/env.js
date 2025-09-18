import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.string().default('4000').transform((v) => parseInt(v, 10)),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(16),
    CORS_ORIGIN: z.string().optional().default('*'),
    ADMIN_EMAIL: z.string().email(),
    ADMIN_PASSWORD: z.string().min(8),
});
export const loadEnv = () => {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
        process.exit(1);
    }
    return parsed.data;
};
