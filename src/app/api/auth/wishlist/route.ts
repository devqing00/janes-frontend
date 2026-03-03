import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity";
import { adminAuth } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

interface StoredItem {
  _key: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

interface WishlistItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

async function verifyToken(request: NextRequest): Promise<string | null> {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(header.split("Bearer ")[1]);
    return decoded.uid;
  } catch {
    return null;
  }
}

async function getCustomer(uid: string) {
  return writeClient.fetch<{ _id: string; wishlist?: StoredItem[] } | null>(
    `*[_type == "customer" && firebaseUid == $uid][0]{ _id, wishlist }`,
    { uid }
  );
}

/** GET /api/auth/wishlist — return the logged-in user's saved wishlist */
export async function GET(request: NextRequest) {
  const uid = await verifyToken(request);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customer = await getCustomer(uid);
  if (!customer) return NextResponse.json({ items: [] });

  const items: WishlistItem[] = (customer.wishlist ?? []).map((w) => ({
    _id: w.productId,
    name: w.name,
    slug: w.slug,
    price: w.price,
    image: w.image ?? null,
  }));

  return NextResponse.json({ items });
}

/** PUT /api/auth/wishlist — overwrite the logged-in user's wishlist */
export async function PUT(request: NextRequest) {
  const uid = await verifyToken(request);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items }: { items: WishlistItem[] } = await request.json();

  const customer = await getCustomer(uid);
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const sanityItems: StoredItem[] = items.map((item) => ({
    _key: item._id,
    productId: item._id,
    name: item.name,
    slug: item.slug,
    price: item.price,
    image: item.image ?? null,
  }));

  await writeClient.patch(customer._id).set({ wishlist: sanityItems }).commit();

  return NextResponse.json({ ok: true });
}
