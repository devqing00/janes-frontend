// Server Component — route segment config is only respected here.
// Force dynamic rendering so this page is never statically prerendered.
export const dynamic = "force-dynamic";

import CallbackWrapper from "./CallbackWrapper";

export default function CheckoutCallbackPage() {
  return <CallbackWrapper />;
}

