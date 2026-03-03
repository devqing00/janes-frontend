import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import { SearchProvider } from "@/components/SearchProvider";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import CartSlideout from "@/components/CartSlideout";
import SearchOverlay from "@/components/SearchOverlay";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider>
      <SiteSettingsProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <SearchProvider>
                <Navbar />
                <main className="min-h-screen">{children}</main>
                <Footer />
                <CartSlideout />
                <SearchOverlay />
              </SearchProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </SiteSettingsProvider>
    </LocaleProvider>
  );
}
