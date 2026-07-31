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

    const auth = getAuthClient(accountId);
    const drive = google.drive({ version: "v3", auth });

    const res = await drive.about.get({
      fields: "storageQuota",
    });

    return NextResponse.json({ 
      quota: {
        ...res.data.storageQuota,
        usageInDrive: res.data.storageQuota?.usageInDrive
      } 
    });
  } catch (error: any) {
    console.error("Drive Quota API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch quota" },
      { status: 500 }
    );
  }
}
