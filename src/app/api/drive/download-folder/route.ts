import { NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";
import { PassThrough } from "stream";
const { ZipArchive } = require("archiver");

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

// Convert Node stream to Web ReadableStream
function nodeToWebStream(nodeStream: NodeJS.ReadableStream): ReadableStream {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      nodeStream.on('end', () => {
        controller.close();
      });
      nodeStream.on('error', (err) => {
        controller.error(err);
      });
    },
    cancel() {
      if ('destroy' in nodeStream && typeof (nodeStream as any).destroy === 'function') {
        (nodeStream as any).destroy();
      }
    }
  });
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get("files_auth_token")?.value !== "authenticated") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId") || "1";
    const folderId = searchParams.get("folderId");
    const folderName = searchParams.get("folderName") || "Archive";

    if (!folderId) {
      return new NextResponse("Missing folderId", { status: 400 });
    }

    const auth = getAuthClient(accountId);
    const drive = google.drive({ version: "v3", auth });

    // Setup zip stream
    const archive = new ZipArchive({
      zlib: { level: 5 }
    });
    
    archive.on('error', function(err: Error) {
      console.error('Archiver error:', err);
    });

    const passThrough = new PassThrough();
    archive.pipe(passThrough);

    // Recursive function to add files to zip
    const processFolder = async (currentFolderId: string, currentPath: string) => {
      let pageToken = undefined;
      do {
        const res: any = await drive.files.list({
          q: `'${currentFolderId}' in parents and trashed = false`,
          fields: "nextPageToken, files(id, name, mimeType)",
          pageToken: pageToken,
          pageSize: 100,
        });

        const files = res.data.files || [];
        for (const file of files) {
          if (!file.id || !file.name) continue;
          
          const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;

          if (file.mimeType === "application/vnd.google-apps.folder") {
            // It's a folder, create directory entry and recurse
            archive.append('', { name: filePath + '/' });
            await processFolder(file.id, filePath);
          } else if (file.mimeType && !file.mimeType.startsWith('application/vnd.google-apps')) {
            // It's a real file, download it and stream to zip
            try {
              const fileStreamRes = await drive.files.get({
                fileId: file.id,
                alt: 'media'
              }, { responseType: 'stream' });
              
              archive.append(fileStreamRes.data as any, { name: filePath });
            } catch (err) {
              console.error(`Failed to download ${file.name}:`, err);
            }
          }
        }
        pageToken = res.data.nextPageToken;
      } while (pageToken);
    };

    // Start background processing and finalize when done
    processFolder(folderId, "").then(() => {
      archive.finalize();
    }).catch((err: any) => {
      console.error("Folder zip error:", err);
      archive.abort();
    });

    const webStream = nodeToWebStream(passThrough);

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(folderName)}.zip"`);
    headers.set('Content-Type', 'application/zip');

    return new NextResponse(webStream, { headers });
    
  } catch (error: any) {
    console.error("Download Folder Error:", error);
    return new NextResponse(error.message || "Failed to zip folder", { status: 500 });
  }
}
