import { NextResponse } from "next/server";

import { setAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") || "");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL("/admin/login?error=Invalid+password", request.url));
  }

  setAdminSession();
  return NextResponse.redirect(new URL("/admin", request.url));
}
