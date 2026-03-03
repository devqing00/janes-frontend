import dynamic from "next/dynamic";

// Must be in a Server Component for the directive to take effect.
// This prevents Next.js from statically prerendering this route,
// which would attempt to initialise Firebase client SDK at build time.
export const dynamic = "force-dynamic";

const CheckoutCallbackClient = dynamic(
  () => import("./CheckoutCallbackClient"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[60vh] flex items-center justify-center">
        <svg
          className="animate-spin w-8 h-8 text-brand-accent"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      </div>
    ),
  }
);

export default function CheckoutCallbackPage() {
  return <CheckoutCallbackClient />;
}

