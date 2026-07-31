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

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get("files_auth_token")?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const accountId = body.accountId || "1";
    const folderId = body.folderId || "root";
    const folderName = body.folderName;

    if (!folderName) {
      return NextResponse.json({ error: "No folder name provided" }, { status: 400 });
    }

    const auth = getAuthClient(accountId);
    const drive = google.drive({ version: "v3", auth });

    const fileMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: folderId === "root" ? [] : [folderId],
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id, name, mimeType, size, modifiedTime, webViewLink, iconLink",
    });

    const f = res.data;
    const newFolder = {
      id: f.id,
      name: f.name,
      type: "folder",
      mimeType: f.mimeType,
      size: undefined,
      updatedAt: f.modifiedTime,
      url: f.webViewLink,
      icon: f.iconLink,
    };

    return NextResponse.json({ success: true, file: newFolder });
  } catch (error: any) {
    console.error("Create Folder Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create folder" },
      { status: 500 }
    );
  }
}
