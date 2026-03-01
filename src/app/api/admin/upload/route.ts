import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const asset = await writeClient.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type,
    });

    return NextResponse.json({
      _id: asset._id,
      url: asset.url,
      assetRef: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
      },
    });
  } catch (err) {
    console.error("Failed to upload image:", err);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
