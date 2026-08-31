import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId') || process.env.DRIVE_FOLDER_ID;
  const search = searchParams.get('search');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const drive = google.drive({ version: 'v3', auth });

    // 1. Ambil daftar file & folder
    let query = `'${folderId}' in parents and trashed = false`;
    if (search) {
      query = `name contains '${search}' and trashed = false`;
    }

    const list = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, size, createdTime)',
      orderBy: 'folder, name',
    });

    // 2. Hitung Statistik Total Dokumen (semua file di Drive)
    const stats = await drive.files.list({
      q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id)',
    });

    return NextResponse.json({
      files: list.data.files || [],
      totalDocs: stats.data.files?.length || 0
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Fitur Rename
export async function PATCH(request: Request) {
  try {
    const { fileId, newName } = await request.json();
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const drive = google.drive({ version: 'v3', auth });

    await drive.files.update({
      fileId: fileId,
      requestBody: { name: newName }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}