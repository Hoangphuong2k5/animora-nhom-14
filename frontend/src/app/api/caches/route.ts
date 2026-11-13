import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Cho phép CMS hoặc hệ thống Admin bên ngoài gọi DELETE /api/caches để xóa cache của Next.js theo tag hoặc path:

export async function DELETE(request: NextRequest) {
  try {
    const { type, value } = (await request.json()) as {
      type?: "path" | "tag";
      value?: string;
    };

    if (type === "path" && value) {
      revalidatePath(value);
      return NextResponse.json({ success: true, revalidatedPath: value });
    }

    if (type === "tag" && value) {
      revalidateTag(value, { expire: 0 });
      return NextResponse.json({ success: true, revalidatedTag: value });
    }

    return NextResponse.json(
      { success: false, message: "Thiếu thông tin type ('path' | 'tag') hoặc value" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }
}
