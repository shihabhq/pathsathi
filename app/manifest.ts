import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "পথসাথী",
    short_name: "পথসাথী",
    description: "অন্ধ মানুষের জন্য বাংলা ভয়েস সঙ্গী (কনসেপ্ট ডেমো)",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0B0B0C",
    theme_color: "#0B0B0C",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
