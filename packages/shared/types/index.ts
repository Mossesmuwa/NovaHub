// packages/shared/types/index.ts
// Shared TypeScript types for web and admin apps

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  isPro: boolean;
  isAdmin: boolean;
  adminRole?: "super_admin" | "moderator" | "analyst";
  createdAt: Date;
}

export interface Item {
  id: string;
  slug: string;
  name: string;
  shortDesc?: string;
  longDesc?: string;
  categoryId: string;
  type?: string;
  image?: string;
  year?: number;
  rating?: number;
  ratingCount: number;
  trending: boolean;
  featured: boolean;
  approved: boolean;
  saveCount: number;
  viewCount: number;
  vertical?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NovaScore {
  value: number;
  label: string;
  breakdown: {
    githubMomentum: number;
    productHuntVelocity: number;
    credibility: number;
    sentiment: number;
  };
  trend: {
    direction: "up" | "down" | "stable";
    percentChange: number;
    reasons: string[];
  };
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface PermissionMatrix {
  [role: string]: string[];
}
