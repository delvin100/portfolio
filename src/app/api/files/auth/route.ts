import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.FILES_ACCESS_PASSWORD;

    if (!correctPassword) {
      return NextResponse.json(
        { error: "Server configuration error: password not set" },
        { status: 500 }
      );
    }

    if (password === correctPassword) {
      const cookieStore = await cookies();
      
      cookieStore.set({
        name: "files_auth_token",
        value: "authenticated",
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 2, // 2 hours
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("files_auth_token");
  return NextResponse.json({ success: true });
}
