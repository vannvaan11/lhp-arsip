import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getAuth() {
  let credentials;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error('EXPORT_AUTH_ERROR: Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON', e);
    }
  }

  if (!credentials && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
}

export async function GET() {
  try {
    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });

    // 1. Ambil daftar folder untuk pemetaan nama folder (OPD / Kategori / Tahun)
    const folderRes = await drive.files.list({
      q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id, name)',
      pageSize: 1000,
    });

    const folderMap: Record<string, string> = {};
    (folderRes.data.files || []).forEach((f) => {
      if (f.id && f.name) {
        folderMap[f.id] = f.name;
      }
    });

    // 2. Ambil seluruh arsip dokumen & file yang tidak di tong sampah
    const listRes = await drive.files.list({
      q: 'trashed = false',
      fields: 'files(id, name, mimeType, size, createdTime, parents)',
      pageSize: 1000,
      orderBy: 'folder, name',
    });

    const allItems = (listRes.data.files || []).map((file) => {
      const parentId = file.parents && file.parents.length > 0 ? file.parents[0] : null;
      const folderName = parentId ? folderMap[parentId] || 'Root / Beranda' : 'Root / Beranda';

      return {
        id: file.id || '',
        name: file.name || 'Tanpa Judul',
        mimeType: file.mimeType || 'unknown',
        size: file.size || '',
        createdTime: file.createdTime || '',
        folderName: folderName,
      };
    });

    return NextResponse.json({
      success: true,
      files: allItems,
      total: allItems.length,
    });
  } catch (error: any) {
    console.error('DRIVE_EXPORT_ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal mengambil data arsip untuk ekspor',
      },
      { status: 500 }
    );
  }
}
