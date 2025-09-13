import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();
interface DBConnect {
    connectDB: () => Promise<void>;
}

const connectDB : DBConnect['connectDB'] = async () => {
    try {
        await prisma.$connect();
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
}
export { connectDB };