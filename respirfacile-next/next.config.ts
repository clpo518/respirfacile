import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // typescript.ignoreBuildErrors et eslint.ignoreDuringBuilds ont été retirés :
  // masquer les erreurs au build revient à livrer sans filet sur une app qui
  // manipule des données de santé. La clé `eslint` n'existe d'ailleurs plus
  // dans NextConfig depuis Next 16, le lint se lance via `npm run lint`.
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fjamlwnxsbdwwtavecmd.supabase.co",
      },
    ],
  },
};

export default nextConfig;
