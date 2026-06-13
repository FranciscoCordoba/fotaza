import { defineConfig } from 'drizzle-kit';

try {
    process.loadEnvFile('.env')
} catch (error) {
    // ignorar
}

export default defineConfig({
    out: '../drizzle',
    schema: './db/schemas',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
