import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { writeClient } from "@/lib/sanity";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/profile
 * Verifies Firebase ID token, creates/updates customer in Sanity, returns profile.
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const body = await request.json();

    // Check if customer already exists in Sanity
    const existing = await writeClient.fetch(
      `*[_type == "customer" && firebaseUid == $uid][0]`,
      { uid }
    );

    if (existing) {
      // Return existing profile
      return NextResponse.json({
        firstName: existing.firstName || "",
        lastName: existing.lastName || "",
        phone: existing.phone || "",
        address: existing.address || "",
        city: existing.city || "",
        state: existing.state || "",
        country: existing.country || "",
      });
    }

    // Create new customer doc in Sanity
    // Try to split displayName into first/last
    const nameParts = (body.displayName || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const newCustomer = await writeClient.create({
      _type: "customer",
      firebaseUid: uid,
      email: body.email || decoded.email || "",
      displayName: body.displayName || "",
      photoURL: body.photoURL || "",
      firstName,
      lastName,
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
    });

    return NextResponse.json({
      firstName: newCustomer.firstName || "",
      lastName: newCustomer.lastName || "",
      phone: newCustomer.phone || "",
      address: newCustomer.address || "",
      city: newCustomer.city || "",
      state: newCustomer.state || "",
      country: newCustomer.country || "",
    });
  } catch (err) {
    console.error("Auth profile sync error:", err);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}

/**
 * PUT /api/auth/profile
 * Updates the customer's saved profile (shipping info) in Sanity.
 */
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const body = await request.json();

    // Find customer
    const existing = await writeClient.fetch(
      `*[_type == "customer" && firebaseUid == $uid][0]{ _id }`,
      { uid }
    );

    if (!existing) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Update profile fields
    const patchData = Object.fromEntries(
      Object.entries({
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country,
      }).filter(([, v]) => v !== undefined)
    );

    await writeClient.patch(existing._id).set(patchData).commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
