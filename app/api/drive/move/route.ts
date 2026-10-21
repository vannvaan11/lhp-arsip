import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getAuth() {
  let credentials;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error('MOVE_AUTH_ERROR: Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON', e);
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
    const { fileId, destinationFolderId, currentFolderId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: 'fileId wajib disertakan' }, { status: 400 });
    }

    const defaultRootId = process.env.DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID;
    const targetParent = (destinationFolderId && destinationFolderId !== 'root')
      ? destinationFolderId
      : defaultRootId;

    if (!targetParent) {
      return NextResponse.json({ error: 'Folder tujuan tidak valid atau tidak ditemukan' }, { status: 400 });
    }

    // 1. Cek Google Apps Script Bridge jika ada
    if (process.env.GOOGLE_APPS_SCRIPT_URL) {
      try {
        const gasRes = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'move',
            fileId,
            destinationFolderId: targetParent,
          }),
        });
        const gasData = await gasRes.json();
        if (gasData && gasData.success) {
          return NextResponse.json({
            success: true,
            message: 'Dokumen berhasil dipindahkan',
            destinationFolderId: targetParent,
          });
        }
      } catch (gasErr: any) {
        console.warn('GAS move fallback to Drive API:', gasErr.message);
      }
    }

    // 2. Inisialisasi Google Drive API
    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });

    // Dapatkan data parent saat ini dari file
    let previousParents = '';
    try {
      const fileMeta = await drive.files.get({
        fileId,
        fields: 'id, name, parents',
        supportsAllDrives: true,
      });

      if (fileMeta.data.parents && fileMeta.data.parents.length > 0) {
        previousParents = fileMeta.data.parents.join(',');
      } else if (currentFolderId && currentFolderId !== 'root') {
        previousParents = currentFolderId;
      }
    } catch (getErr: any) {
      console.warn('Gagal membaca parent file, mencoba langsung update:', getErr.message);
      if (currentFolderId && currentFolderId !== 'root') {
        previousParents = currentFolderId;
      }
    }

    // Lakukan pemindahan folder dengan addParents dan removeParents
    const updateParams: any = {
      fileId,
      addParents: targetParent,
      fields: 'id, name, parents',
      supportsAllDrives: true,
    };

    if (previousParents && previousParents !== targetParent) {
      updateParams.removeParents = previousParents;
    }

    const updated = await drive.files.update(updateParams);

    return NextResponse.json({
      success: true,
      message: 'Dokumen berhasil dipindahkan',
      file: updated.data,
      destinationFolderId: targetParent,
    });
  } catch (error: any) {
    console.error('MOVE_DOCUMENT_ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memindahkan dokumen ke folder tujuan' },
      { status: 500 }
    );
  }
}
