import { google } from 'googleapis';
import { NextResponse } from 'next/server';

// Baris ini sangat penting agar Vercel tidak menganggap ini file statis
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Cek apakah kunci rahasia ada
    const credentialsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const folderId = process.env.DRIVE_FOLDER_ID;

    if (!credentialsRaw || !folderId) {
      return NextResponse.json({ error: 'Konfigurasi ENV tidak lengkap' }, { status: 500 });
    }

    // 2. Hubungkan ke Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentialsRaw),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });
    
    // 3. Ambil daftar file
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      orderBy: 'name',
    });

    return NextResponse.json(response.data.files || []);
  } catch (error: any) {
    console.error('Drive Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}