import dotenv from 'dotenv';
dotenv.config();

interface Config {
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    RESEND_API_KEY: string;
}

const config: Config = {
    PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    DATABASE_URL: process.env.DATABASE_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
};

export default config;