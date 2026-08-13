import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock Management Portal — Wall King Admin",
  description: "Internal admin portal for managing Wall King wallpaper inventory",
  robots: { index: false, follow: false },
};

export default function AdminStockLayout({ children }: { children: React.ReactNode }) {
  return children;
}
