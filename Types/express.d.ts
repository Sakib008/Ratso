import { User } from "../prisma/types.ts";

declare global {
    namespace Express {
        interface Request {
            user?: User | null;
            file?: Express.Multer.File;
        }
    }
}