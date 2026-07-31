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
    const fileId = searchParams.get("fileId");
    
    if (!fileId) {
      return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
    }

    const auth = getAuthClient(accountId);
    const drive = google.drive({ version: "v3", auth });

    // First get the file metadata for the name and mime type
    const metadata = await drive.files.get({
      fileId: fileId,
      fields: "name, mimeType",
    });

    const isGoogleDocs = metadata.data.mimeType?.startsWith("application/vnd.google-apps.");
    let responseStream;

    if (isGoogleDocs) {
      // Export google docs to PDF
      const res = await drive.files.export(
        { fileId, mimeType: "application/pdf" },
        { responseType: "stream" }
      );
      responseStream = res.data;
      metadata.data.name = `${metadata.data.name}.pdf`;
      metadata.data.mimeType = "application/pdf";
    } else {
      // Get regular file
      const res = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "stream" }
      );
      responseStream = res.data;
    }

    // Convert Node.js stream to Web Stream
    const stream = new ReadableStream({
      start(controller) {
        responseStream.on("data", (chunk: Buffer) => controller.enqueue(chunk));
        responseStream.on("end", () => controller.close());
        responseStream.on("error", (err: Error) => controller.error(err));
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Disposition": `inline; filename="${encodeURIComponent(metadata.data.name || "file")}"`,
        "Content-Type": metadata.data.mimeType || "application/octet-stream",
      },
    });
  } catch (error: any) {
    console.error("Download Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to download file" },
      { status: 500 }
    );
  }
}
