import { NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";

function getAuthClient(accountId: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken =
    accountId === "2"
      ? process.env.DRIVE_2_REFRESH_TOKEN
      : process.env.DRIVE_1_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Google API credentials for this account");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get("files_auth_token")?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { accountId, fileId, newName } = body;

    if (!fileId || !newName) {
      return NextResponse.json({ error: "Missing fileId or newName" }, { status: 400 });
    }

    const auth = getAuthClient(accountId || "1");
    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.update({
      fileId: fileId,
      requestBody: {
        name: newName,
      },
    });

    return NextResponse.json({ success: true, file: res.data });
  } catch (error: any) {
    console.error("Rename Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to rename item" },
      { status: 500 }
    );
  }
}
