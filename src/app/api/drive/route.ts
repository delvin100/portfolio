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

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get("files_auth_token")?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId") || "1";
    const folderId = searchParams.get("folderId") || "root";
    const searchQuery = searchParams.get("q") || "";

    const auth = getAuthClient(accountId);
    const drive = google.drive({ version: "v3", auth });

    let query = `'${folderId}' in parents and trashed = false`;
    if (searchQuery) {
      // If searching, ignore folder constraint and search whole drive
      query = `name contains '${searchQuery}' and trashed = false`;
    }

    const res = await drive.files.list({
      q: query,
      fields: "files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink)",
      orderBy: "folder, name",
      pageSize: 100,
    });

    const files = res.data.files?.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.mimeType === "application/vnd.google-apps.folder" ? "folder" : "file",
      mimeType: f.mimeType,
      size: f.size ? formatBytes(parseInt(f.size)) : undefined,
      updatedAt: f.modifiedTime,
      url: f.webViewLink,
      icon: f.iconLink,
    })) || [];

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("Drive API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch files" },
      { status: 500 }
    );
  }
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
