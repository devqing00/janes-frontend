import { Suspense } from "react";
import ShopPageClient from "@/components/ShopPageClient";

export const metadata = {
  title: "Shop — JANES",
  description: "Browse our curated collection of luxurious contemporary fashion.",
};

export default function ShopPage() {
  return (
    <Suspense>
      <ShopPageClient />
    </Suspense>
  );
}
