import NotFound from "@/components/NotFound";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The requested page could not be found.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GlobalNotFound() {
  return <NotFound />;
}
