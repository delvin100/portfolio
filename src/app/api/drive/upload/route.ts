import { NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";
import { Readable } from "stream";

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

// Convert Web API ReadableStream to Node.js Readable stream
function webToNodeStream(webStream: ReadableStream<Uint8Array>): NodeJS.ReadableStream {
  const reader = webStream.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(Buffer.from(value));
      }
    },
  });
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get("files_auth_token")?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const accountId = formData.get("accountId") as string || "1";
    const folderId = formData.get("folderId") as string || "root";
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const auth = getAuthClient(accountId);
    const drive = google.drive({ version: "v3", auth });

    const fileMetadata = {
      name: file.name,
      parents: folderId === "root" ? [] : [folderId],
    };

    const media = {
      mimeType: file.type || "application/octet-stream",
      body: webToNodeStream(file.stream()),
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, mimeType, size, modifiedTime, webViewLink, iconLink",
    });

    const f = res.data;
    const newFile = {
      id: f.id,
      name: f.name,
      type: f.mimeType === "application/vnd.google-apps.folder" ? "folder" : "file",
      mimeType: f.mimeType,
      size: f.size ? formatBytes(parseInt(f.size)) : undefined,
      updatedAt: f.modifiedTime,
      url: f.webViewLink,
      icon: f.iconLink,
    };

    return NextResponse.json({ success: true, file: newFile });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
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
