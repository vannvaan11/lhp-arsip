import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

const LOG_FILE_NAME = 'activity_logs.json';

const getDriveClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
};

// GET: Ambil isi Log dari Drive
export async function GET() {
  try {
    const drive = getDriveClient();
    
    // Cari file log
    const list = await drive.files.list({
      q: `name = '${LOG_FILE_NAME}' and trashed = false`,
      fields: 'files(id)',
    });

    if (!list.data.files || list.data.files.length === 0) {
      return NextResponse.json([]); // Belum ada log
    }

    const fileId = list.data.files[0].id!;
    const res = await drive.files.get({ fileId, alt: 'media' });
    
    return NextResponse.json(res.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Tambahkan Log baru ke Drive
export async function POST(req: NextRequest) {
  try {
    const drive = getDriveClient();
    const body = await req.json();

    // Cari file log
    const list = await drive.files.list({
      q: `name = '${LOG_FILE_NAME}' and trashed = false`,
      fields: 'files(id)',
    });

    let logs: any[] = [];
    let fileId: string | null = null;

    if (list.data.files && list.data.files.length > 0) {
      fileId = list.data.files[0].id!;
      const res = await drive.files.get({ fileId, alt: 'media' });
      logs = res.data as any[];
    }

    // Tambah log baru di posisi paling atas
    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      ...body,
      timestamp: new Date().toLocaleString('id-ID'),
    };
    
    logs = [newEntry, ...logs].slice(0, 500); // Batasi 500 log terakhir

    const stream = new Readable();
    stream.push(JSON.stringify(logs));
    stream.push(null);

    if (fileId) {
      // Update file yang sudah ada
      await drive.files.update({
        fileId,
        media: { mimeType: 'application/json', body: stream },
      });
    } else {
      // Buat file baru jika belum ada
      await drive.files.create({
        requestBody: {
          name: LOG_FILE_NAME,
          parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
        },
        media: { mimeType: 'application/json', body: stream },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}