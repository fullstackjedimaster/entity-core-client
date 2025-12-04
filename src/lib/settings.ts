// /src/lib/settings.ts
// Pure client-side configuration for CRUD Client (Next.js)

export interface AppSettings {
    AUTH0_DOMAIN: string;
    AUTH0_CLIENT_ID: string;
    AUTH0_AUDIENCE: string;
    AUTH0_NAMESPACE: string;
    API_BASE_URL: string;
    CRUD_SERVER_URL: string;
    CRUD_SERVER_API_KEY: string;
    AUTH0_SCOPE: string;
    DISABLE_AUTH: string;
}

// -----------------------------------------------------------------------------
// Browser-safe configuration using NEXT_PUBLIC_* environment variables
// -----------------------------------------------------------------------------
export const settings: AppSettings = {
    AUTH0_DOMAIN: process.env.NEXT_PUBLIC_AUTH0_DOMAIN || "",
    AUTH0_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || "",
    AUTH0_AUDIENCE: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || "",
    AUTH0_NAMESPACE:
        process.env.NEXT_PUBLIC_AUTH0_NAMESPACE || "https://fullstackjedi.dev",
    API_BASE_URL:
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://crud-server.fullstackjedi.dev",
    CRUD_SERVER_URL:
        process.env.NEXT_PUBLIC_CRUD_SERVER_URL ||
        "https://crud-server.fullstackjedi.dev",
    CRUD_SERVER_API_KEY:
        process.env.NEXT_PUBLIC_CRUD_SERVER_API_KEY || "",
    AUTH0_SCOPE:
        process.env.NEXT_PUBLIC_AUTH0_SCOPE || "openid profile email crud:read crud:creatw crud:update crud:delete offline_access",
    DISABLE_AUTH: process.env.NEXT_PUBLIC_DISABLE_AUTH || "false",
};

// Optional one-line export for convenience in imports
export default settings;
