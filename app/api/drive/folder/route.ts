import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getAuth() {
  let credentials;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error('FOLDER_AUTH_ERROR: Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON', e);
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
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
}

export async function POST(request: Request) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak: Hanya Administrator yang dapat membuat folder.' }, { status: 403 });
    }
    const { name, parentId } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama folder wajib diisi' }, { status: 400 });
    }

    const defaultRootId = process.env.DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID;
    const targetParent = (parentId && parentId !== 'root') ? parentId : defaultRootId;

    // 1. Cek Google Apps Script Bridge jika ada
    if (process.env.GOOGLE_APPS_SCRIPT_URL) {
      try {
        const gasRes = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'createFolder',
            name: name.trim(),
            parentId: targetParent,
          }),
        });
        const gasData = await gasRes.json();
        if (gasData && gasData.success) {
          return NextResponse.json({
            success: true,
            folder: {
              id: gasData.id,
              name: gasData.name,
              mimeType: 'application/vnd.google-apps.folder',
            },
          });
        }
      } catch (gasErr: any) {
        console.warn('GAS createFolder fallback to Drive API:', gasErr.message);
      }
    }

    // 2. Gunakan Google Drive API
    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });

    const requestBody: any = {
      name: name.trim(),
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (targetParent) {
      requestBody.parents = [targetParent];
    }

    const response = await drive.files.create({
      requestBody,
      fields: 'id, name, mimeType, parents',
      supportsAllDrives: true,
    });

    return NextResponse.json({
      success: true,
      folder: response.data,
    });
  } catch (error: any) {
    console.error('CREATE_FOLDER_ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat folder baru di Google Drive' },
      { status: 500 }
    );
  }
}
