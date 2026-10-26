import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

function getAuth() {
  let credentials;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error('UPLOAD_AUTH_ERROR: Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON', e);
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

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak: Hanya Administrator yang dapat mengunggah berkas.' }, { status: 403 });
    }
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const parentId = formData.get('parentId') as string;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // 1. Tentukan Folder Tujuan (Gunakan default jika parentId kosong)
    const targetFolder = (parentId && parentId !== 'undefined' && parentId !== '') 
      ? parentId 
      : (process.env.DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID);

    if (!targetFolder) {
      return NextResponse.json({ error: "ID Folder tujuan tidak ditentukan" }, { status: 400 });
    }

    // 2. Cek apakah ada Google Apps Script Web App Bridge (Solusi bypass kuota untuk Drive personal @gmail.com)
    if (process.env.GOOGLE_APPS_SCRIPT_URL) {
      try {
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');

        const gasRes = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upload',
            folderId: targetFolder,
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            base64: base64,
          }),
        });

        const gasData = await gasRes.json();
        if (gasData.success) {
          return NextResponse.json({ 
            success: true, 
            id: gasData.id, 
            name: gasData.name 
          });
        } else {
          throw new Error(gasData.error || 'Gagal mengunggah melalui Google Apps Script');
        }
      } catch (gasErr: any) {
        console.error("GAS_UPLOAD_ERROR:", gasErr);
        return NextResponse.json({ 
          error: "Upload melalui Apps Script gagal", 
          details: gasErr.message 
        }, { status: 500 });
      }
    }

    // 3. Inisialisasi Auth Google Drive API (bekerja langsung pada Shared Drive / Google Workspace)
    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });

    // 4. Konversi File ke Buffer & Readable Stream
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // 5. Eksekusi Upload ke Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [targetFolder],
      },
      media: {
        mimeType: file.type || 'application/octet-stream',
        body: stream,
      },
      supportsAllDrives: true,
      fields: 'id, name',
    });

    return NextResponse.json({ 
      success: true, 
      id: response.data.id, 
      name: response.data.name 
    });

  } catch (error: any) {
    console.error("DRIVE_UPLOAD_ERROR:", error);

    const isQuotaError = 
      error.message?.includes('storage quota') || 
      error.message?.includes('Service Accounts do not have storage quota') ||
      (error.response?.data?.error?.message && error.response.data.error.message.includes('storage quota'));

    if (isQuotaError) {
      return NextResponse.json({ 
        error: "Google Drive membatasi kuota Service Account (0 byte) pada akun personal.", 
        details: "Google melarang Service Account mengunggah file ke Google Drive personal tanpa Shared Drive. Pasang GOOGLE_APPS_SCRIPT_URL di .env.local atau gunakan Google Workspace Shared Drive.",
        solution: "apps_script_needed"
      }, { status: 403 });
    }

    return NextResponse.json({ 
      error: "Upload Gagal", 
      details: error.message 
    }, { status: 500 });
  }
}