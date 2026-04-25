/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "static.ah.nl" },
      { protocol: "https", hostname: "image.ah.nl" },
      { protocol: "https", hostname: "assets.ah.nl" },
      { protocol: "https", hostname: "static.dirk.nl" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "bunq-triage-model-storage-public.s3.eu-central-1.amazonaws.com" }
    ]
  }
};

export default nextConfig;
