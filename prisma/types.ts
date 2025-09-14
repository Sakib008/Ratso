export type User = {
  id: number;
  email: string;
  name: string ;
  address: string;
  role: Role;
  profileImage?: string | null;
  isEmailVerified: boolean;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
  temporaryToken?: string | null;
  temporaryTokenExpiry?: Date | null;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  reviews: Review[];
};

export type Review = {
  id: number;
  rating: number;
  comment?: string | null;
  user: User;
  store: Store;
  userId: number;
  storeId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Store = {
  id: number;
  name: string;
  address?: string | null;
  overallRating?: number | null;
  totalReviews: number;
  storeOwnerId: number;
  storeOwner: User;
  storeImage?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  description?: string | null;
  reviews: Review[];
  submittedReviews: number;
  createdAt: Date;
  updatedAt: Date;
};

export enum Role {
    USER = 'user',
    ADMIN = 'admin',
    STORE_OWNER = 'storeOwner'
}

export enum StoreStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}
